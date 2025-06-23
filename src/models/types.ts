export interface Place {
  id: string;
  name: string;
  area: string;
}

export interface Area {
  name: string;
  travelBufferMinutes: number; // Buffer time for travel within the same area
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
}

export interface BookedSlot {
  id: string;
  placeId: string;
  date: string; // Format: "YYYY-MM-DD"
  startTime: string; // Format: "HH:MM" in 24-hour format
  endTime: string; // Format: "HH:MM" in 24-hour format
  customerName: string;
  customerEmail: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
