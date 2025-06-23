import { addMinutes, format, parseISO, setHours, setMinutes, getDaysInMonth } from 'date-fns';
import { AvailabilityRule, BookedSlot, Place, TimeSlot } from '../models/types';
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
    
    // Get places from Firebase
    const places = await getFirebasePlaces(userId);
    const selectedPlace = places.find((place: Place) => place.id === placeId);
    if (!selectedPlace) {
      console.log('Selected place not found');
      return [];
    }

    // Get area travel buffer time from Firebase
    let travelBufferMinutes = 0;
    try {
      const areas = await getFirebaseAreas(userId);
      const area = areas.find((a: any) => a.name === selectedPlace.area);
      travelBufferMinutes = area ? area.travelBufferMinutes : 0;
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  
    // Get current day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const dayOfWeek = date.getDay();
    console.log(`Checking availability for ${date.toDateString()}, day of week: ${dayOfWeek}`);
    
    // Get availability rules from Firebase
    const allRules = await getFirebaseAvailabilityRules(userId);
    console.log(`All rules:`, allRules);
    
    // Filter rules for the current day of week
    const availabilityRules = allRules.filter((rule: AvailabilityRule) => {
      const matches = rule.dayOfWeek === dayOfWeek;
      console.log(`Rule day ${rule.dayOfWeek}, matches current day ${dayOfWeek}: ${matches}`);
      return matches;
    });
    
    console.log(`Found ${availabilityRules.length} rules for day ${dayOfWeek}:`, availabilityRules);
    
    if (availabilityRules.length === 0) {
      console.log('No availability rules match this day');
      return [];
    }
    
    // Get all booked slots for this date from Firebase
    const bookedSlots = await getFirebaseBookedSlots(userId);
    
    // Filter booked slots for this date
    const bookedSlotsForDate = bookedSlots.filter((slot: BookedSlot) => slot.date === dateStr);
    console.log(`Found ${bookedSlotsForDate.length} booked slots for date ${dateStr}`);
    
    // Filter for this place
    const bookedSlotsForPlace = bookedSlotsForDate.filter(
      (slot: BookedSlot) => slot.placeId === placeId
    );
    
    // Get other booked slots in the same area to respect buffer time
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
    
    const daysInMonth = getDaysInMonth(month);
    const availableDays: Date[] = [];
    
    // Get availability rules from Firebase
    const allRules = await getFirebaseAvailabilityRules(userId);
    
    if (!allRules || allRules.length === 0) {
      console.log('No availability rules found');
      return [];
    }
    
    console.log(`Found ${allRules.length} availability rules`);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Check if there are availability rules for this day
      const hasRules = allRules.some((rule: AvailabilityRule) => rule.dayOfWeek === dayOfWeek);
      
      if (hasRules) {
        availableDays.push(date);
      }
    }
    
    console.log(`Found ${availableDays.length} available days`);
    return availableDays;
  } catch (error) {
    console.error('Error getting days with availability:', error);
    return [];
  }
};
