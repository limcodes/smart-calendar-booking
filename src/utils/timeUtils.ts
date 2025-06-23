import { addMinutes, format, parse, parseISO, setHours, setMinutes, isSameDay } from 'date-fns';
import { AvailabilityRule, BookedSlot, Place, TimeSlot } from '../models/types';
import { getAreaByName, getAvailabilityRules, getBookedSlots, getPlaces } from './storageService';

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
export const getAvailableSlots = (
  placeId: string,
  date: Date,
  slotDurationMinutes: number = 60
): TimeSlot[] => {
  const places = getPlaces();
  const selectedPlace = places.find(place => place.id === placeId);
  if (!selectedPlace) return [];

  // Get area travel buffer time
  const area = getAreaByName(selectedPlace.area);
  const travelBufferMinutes = area ? area.travelBufferMinutes : 0;

  // Get availability rules for the selected day
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const availabilityRules = getAvailabilityRules().filter(rule => rule.dayOfWeek === dayOfWeek);
  
  if (availabilityRules.length === 0) return []; // No availability for this day

  // Get all booked slots for this date and place
  const dateStr = format(date, 'yyyy-MM-dd');
  const allBookedSlots = getBookedSlots().filter(
    slot => slot.date === dateStr
  );

  // Find all booked slots for this place
  const bookedSlotsForPlace = allBookedSlots.filter(
    slot => slot.placeId === placeId
  );

  // Get booked slots for other places in the same area
  const otherPlaceBookedSlots = allBookedSlots.filter(slot => {
    if (slot.placeId === placeId) return false;
    const slotPlace = places.find(p => p.id === slot.placeId);
    return slotPlace && slotPlace.area === selectedPlace.area;
  });

  // Combine all rules and generate potential slots
  const allSlots: TimeSlot[] = [];
  
  availabilityRules.forEach(rule => {
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
  bookedSlotsForPlace.forEach(bookedSlot => {
    const bookedStart = parseTimeString(bookedSlot.startTime, dateStr);
    const bookedEnd = parseTimeString(bookedSlot.endTime, dateStr);
    
    allSlots.forEach(slot => {
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
  otherPlaceBookedSlots.forEach(bookedSlot => {
    const bookedStart = parseTimeString(bookedSlot.startTime, dateStr);
    const bookedEnd = parseTimeString(bookedSlot.endTime, dateStr);
    
    // Add buffer time to determine the unavailable time range
    const bufferBeforeStart = addMinutes(bookedStart, -travelBufferMinutes);
    const bufferAfterEnd = addMinutes(bookedEnd, travelBufferMinutes);
    
    allSlots.forEach(slot => {
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
};

// Get days with available slots for the current month
export const getDaysWithAvailability = (
  placeId: string,
  month: Date
): Date[] => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const availableDays: Date[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const dayOfWeek = date.getDay();
    
    // Check if there are availability rules for this day
    const hasRules = getAvailabilityRules().some(rule => rule.dayOfWeek === dayOfWeek);
    
    if (hasRules) {
      availableDays.push(date);
    }
  }

  return availableDays;
};
