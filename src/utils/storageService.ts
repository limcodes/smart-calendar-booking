import { Area, AvailabilityRule, BookedSlot, Place } from "../models/types";

const PLACES_KEY = 'smart_calendar_places';
const AREAS_KEY = 'smart_calendar_areas';
const AVAILABILITY_RULES_KEY = 'smart_calendar_availability_rules';
const BOOKED_SLOTS_KEY = 'smart_calendar_booked_slots';

// Helper functions to parse data from localStorage
const getStoredData = <T>(key: string): T[] => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : [];
};

// Helper function to save data to localStorage
const saveData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Places
export const getPlaces = (): Place[] => {
  return getStoredData<Place>(PLACES_KEY);
};

export const addPlace = (place: Omit<Place, 'id'>): Place => {
  const places = getPlaces();
  const newPlace = {
    ...place,
    id: Date.now().toString()
  };
  
  places.push(newPlace);
  saveData(PLACES_KEY, places);
  return newPlace;
};

export const updatePlace = (place: Place): void => {
  const places = getPlaces();
  const index = places.findIndex(p => p.id === place.id);
  
  if (index !== -1) {
    places[index] = place;
    saveData(PLACES_KEY, places);
  }
};

export const deletePlace = (placeId: string): void => {
  const places = getPlaces().filter(p => p.id !== placeId);
  saveData(PLACES_KEY, places);
};

// Areas
export const getAreas = (): Area[] => {
  return getStoredData<Area>(AREAS_KEY);
};

export const getAreaByName = (areaName: string): Area | undefined => {
  return getAreas().find(area => area.name === areaName);
};

export const addArea = (area: Area): void => {
  const areas = getAreas();
  if (!areas.some(a => a.name === area.name)) {
    areas.push(area);
    saveData(AREAS_KEY, areas);
  }
};

export const updateArea = (area: Area): void => {
  const areas = getAreas();
  const index = areas.findIndex(a => a.name === area.name);
  
  if (index !== -1) {
    areas[index] = area;
    saveData(AREAS_KEY, areas);
  }
};

export const deleteArea = (areaName: string): void => {
  const areas = getAreas().filter(a => a.name !== areaName);
  saveData(AREAS_KEY, areas);
};

// Availability Rules
export const getAvailabilityRules = (): AvailabilityRule[] => {
  return getStoredData<AvailabilityRule>(AVAILABILITY_RULES_KEY);
};

export const addAvailabilityRule = (rule: Omit<AvailabilityRule, 'id'>): AvailabilityRule => {
  const rules = getAvailabilityRules();
  const newRule = {
    ...rule,
    id: Date.now().toString()
  };
  
  rules.push(newRule);
  saveData(AVAILABILITY_RULES_KEY, rules);
  return newRule;
};

export const updateAvailabilityRule = (rule: AvailabilityRule): void => {
  const rules = getAvailabilityRules();
  const index = rules.findIndex(r => r.id === rule.id);
  
  if (index !== -1) {
    rules[index] = rule;
    saveData(AVAILABILITY_RULES_KEY, rules);
  }
};

export const deleteAvailabilityRule = (ruleId: string): void => {
  const rules = getAvailabilityRules().filter(r => r.id !== ruleId);
  saveData(AVAILABILITY_RULES_KEY, rules);
};

// Booked Slots
export const getBookedSlots = (): BookedSlot[] => {
  return getStoredData<BookedSlot>(BOOKED_SLOTS_KEY);
};

export const addBookedSlot = (slot: Omit<BookedSlot, 'id'>): BookedSlot => {
  const slots = getBookedSlots();
  const newSlot = {
    ...slot,
    id: Date.now().toString()
  };
  
  slots.push(newSlot);
  saveData(BOOKED_SLOTS_KEY, slots);
  return newSlot;
};

export const updateBookedSlot = (slot: BookedSlot): void => {
  const slots = getBookedSlots();
  const index = slots.findIndex(s => s.id === slot.id);
  
  if (index !== -1) {
    slots[index] = slot;
    saveData(BOOKED_SLOTS_KEY, slots);
  }
};

export const deleteBookedSlot = (slotId: string): void => {
  const slots = getBookedSlots().filter(s => s.id !== slotId);
  saveData(BOOKED_SLOTS_KEY, slots);
};
