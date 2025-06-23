import { addMinutes, format, parseISO, setHours, setMinutes, getDaysInMonth } from 'date-fns';
import { Area, AvailabilityRule, BookedSlot, Place, TimeSlot } from '../models/types';
import { getAuth } from 'firebase/auth';

// Import Firebase services
import {
  getAvailabilityRules as getFirebaseAvailabilityRules,
  getPlaces as getFirebasePlaces,
  getBookedSlots as getFirebaseBookedSlots,
  getAreas as getFirebaseAreas
} from '../services/firebaseDataService';

// Get current user ID from Firebase Auth
export const getCurrentUserId = (): string => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error('No user is signed in');
    return '';
  }
  return user.uid;
};

// Parse time string (HH:MM) to Date
export const parseTimeString = (timeStr: string, dateStr?: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const baseDate = dateStr ? parseISO(dateStr) : new Date();
  return setMinutes(setHours(baseDate, hours), minutes);
};

// Format Date to time string (HH:MM)
export const formatTimeString = (date: Date): string => {
  return format(date, 'HH:mm');
};

// Get available time slots for a specific day and place
// Cache for frequently accessed data to reduce Firebase calls
const dataCache: {
  places?: Place[],
  areas?: Area[],
  rules?: AvailabilityRule[],
  bookedSlots?: {[date: string]: BookedSlot[]},
  timestamp: number
} = { timestamp: 0 };

// Cache TTL in milliseconds (1 minute)
const CACHE_TTL = 60 * 1000;

export const getAvailableSlots = async (
  placeId: string,
  date: Date,
  slotDurationMinutes: number = 60
): Promise<TimeSlot[]> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is signed in');
      return [];
    }

    // Format date string for slot comparisons
    const dateStr = format(date, 'yyyy-MM-dd');
    const now = Date.now();
    const isCacheExpired = now - dataCache.timestamp > CACHE_TTL;
    
    // Batch fetch data to reduce Firebase calls
    if (!dataCache.places || !dataCache.areas || !dataCache.rules || isCacheExpired) {
      // Fetch all required data in parallel to improve performance
      const [places, areas, rules, bookedSlots] = await Promise.all([
        getFirebasePlaces(userId),
        getFirebaseAreas(userId),
        getFirebaseAvailabilityRules(userId),
        getFirebaseBookedSlots(userId)
      ]);
      
      // Update cache
      dataCache.places = places;
      dataCache.areas = areas;
      dataCache.rules = rules;
      dataCache.bookedSlots = {};
      
      // Group booked slots by date for faster lookups
      bookedSlots.forEach((slot: BookedSlot) => {
        if (!dataCache.bookedSlots![slot.date]) {
          dataCache.bookedSlots![slot.date] = [];
        }
        dataCache.bookedSlots![slot.date].push(slot);
      });
      
      dataCache.timestamp = now;
    }
    
    // Use cached data
    const places = dataCache.places!;
    const areas = dataCache.areas!;
    const allRules = dataCache.rules!;
    const bookedSlotsForDate = dataCache.bookedSlots![dateStr] || [];
    
    // Find selected place
    const selectedPlace = places.find((place: Place) => place.id === placeId);
    if (!selectedPlace) {
      console.log('Selected place not found');
      return [];
    }

    // Get area travel buffer time
    let travelBufferMinutes = 0;
    const area = areas.find((a: any) => a.name === selectedPlace.area);
    travelBufferMinutes = area ? area.travelBufferMinutes : 0;
  
    // Get current day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const dayOfWeek = date.getDay();
    
    // Filter rules for the current day of week (pre-compute this for better performance)
    const availabilityRules = allRules.filter(
      (rule: AvailabilityRule) => rule.dayOfWeek === dayOfWeek
    );
    
    if (availabilityRules.length === 0) {
      return [];
    }
    
    // Separate booked slots for efficiency
    const bookedSlotsForPlace = bookedSlotsForDate.filter(
      (slot: BookedSlot) => slot.placeId === placeId
    );
    
    // Get other booked slots in the same area (optimize with index lookup)
    const otherPlaceBookedSlots = bookedSlotsForDate.filter((slot: BookedSlot) => {
      if (slot.placeId === placeId) return false; // Exclude this place
      
      // Check if the slot is for a place in the same area
      const slotPlace = places.find((p: Place) => p.id === slot.placeId);
      return slotPlace && slotPlace.area === selectedPlace.area;
    });
    
    // Combine all rules and generate potential slots
    const allSlots: TimeSlot[] = [];
    
    // Process each availability rule to create slots
    availabilityRules.forEach((rule: AvailabilityRule) => {
      const startDate = parseTimeString(rule.startTime, dateStr);
      const endDate = parseTimeString(rule.endTime, dateStr);
      
      let currentTime = startDate;
      
      while (currentTime < endDate) {
        const slotStartTime = formatTimeString(currentTime);
        const slotEndTime = formatTimeString(addMinutes(currentTime, slotDurationMinutes));
        
        const slot: TimeSlot = {
          startTime: slotStartTime,
          endTime: slotEndTime,
          isAvailable: true
        };
        
        allSlots.push(slot);
        currentTime = addMinutes(currentTime, slotDurationMinutes);
      }
    });

    // Mark slots as unavailable if they overlap with booked slots for this place
    bookedSlotsForPlace.forEach((bookedSlot: BookedSlot) => {
      const bookedStart = parseTimeString(bookedSlot.startTime, dateStr);
      const bookedEnd = parseTimeString(bookedSlot.endTime, dateStr);
      
      allSlots.forEach((slot: TimeSlot) => {
        const slotStart = parseTimeString(slot.startTime, dateStr);
        const slotEnd = parseTimeString(slot.endTime, dateStr);
        
        if (
          (slotStart >= bookedStart && slotStart < bookedEnd) ||
          (slotEnd > bookedStart && slotEnd <= bookedEnd) ||
          (slotStart <= bookedStart && slotEnd >= bookedEnd)
        ) {
          slot.isAvailable = false;
        }
      });
    });

    // Consider buffer time for other places in the same area
    otherPlaceBookedSlots.forEach((bookedSlot: BookedSlot) => {
      const bookedStart = parseTimeString(bookedSlot.startTime, dateStr);
      const bookedEnd = parseTimeString(bookedSlot.endTime, dateStr);
      
      // Add buffer time to determine the unavailable time range
      const bufferBeforeStart = addMinutes(bookedStart, -travelBufferMinutes);
      const bufferAfterEnd = addMinutes(bookedEnd, travelBufferMinutes);
      
      allSlots.forEach((slot: TimeSlot) => {
        const slotStart = parseTimeString(slot.startTime, dateStr);
        const slotEnd = parseTimeString(slot.endTime, dateStr);
        
        if (
          (slotStart >= bufferBeforeStart && slotStart < bufferAfterEnd) ||
          (slotEnd > bufferBeforeStart && slotEnd <= bufferAfterEnd) ||
          (slotStart <= bufferBeforeStart && slotEnd >= bufferAfterEnd)
        ) {
          slot.isAvailable = false;
        }
      });
    });

    return allSlots;
  } catch (error) {
    console.error('Error getting available slots:', error);
    return [];
  }
};

// Get days with available slots for the current month
export const getDaysWithAvailability = async (
  placeId: string,
  month: Date
): Promise<Date[]> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is signed in');
      return [];
    }
    
    const now = Date.now();
    const isCacheExpired = now - dataCache.timestamp > CACHE_TTL;
    
    // Use cached rules if available and not expired
    if (!dataCache.rules || isCacheExpired) {
      // Fetch rules from Firebase
      const rules = await getFirebaseAvailabilityRules(userId);
      
      // Update cache
      dataCache.rules = rules;
      dataCache.timestamp = now;
    }
    
    const allRules = dataCache.rules!;
    
    if (allRules.length === 0) {
      return [];
    }
    
    // Pre-compute available days of week for better performance
    const availableDaysOfWeek = new Set<number>();
    allRules.forEach((rule: AvailabilityRule) => {
      availableDaysOfWeek.add(rule.dayOfWeek);
    });
    
    const daysInMonth = getDaysInMonth(month);
    const availableDays: Date[] = [];

    // Fast path - check all days at once instead of querying for each
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Using Set.has() is much faster than array.some()
      if (availableDaysOfWeek.has(dayOfWeek)) {
        availableDays.push(date);
      }
    }
    
    return availableDays;
  } catch (error) {
    console.error('Error getting days with availability:', error);
    return [];
  }
};
