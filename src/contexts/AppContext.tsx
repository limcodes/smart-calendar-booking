import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Area, AvailabilityRule, BookedSlot, Place } from '../models/types';
import * as StorageService from '../utils/storageService';

interface AppContextType {
  places: Place[];
  areas: Area[];
  availabilityRules: AvailabilityRule[];
  bookedSlots: BookedSlot[];
  selectedPlace: Place | null;
  selectedDate: Date;
  refreshData: () => void;
  addPlace: (place: Omit<Place, 'id'>) => Place;
  updatePlace: (place: Place) => void;
  deletePlace: (placeId: string) => void;
  addArea: (area: Area) => void;
  updateArea: (area: Area) => void;
  deleteArea: (areaName: string) => void;
  addAvailabilityRule: (rule: Omit<AvailabilityRule, 'id'>) => AvailabilityRule;
  updateAvailabilityRule: (rule: AvailabilityRule) => void;
  deleteAvailabilityRule: (ruleId: string) => void;
  addBookedSlot: (slot: Omit<BookedSlot, 'id'>) => BookedSlot;
  updateBookedSlot: (slot: BookedSlot) => void;
  deleteBookedSlot: (slotId: string) => void;
  setSelectedPlace: (place: Place | null) => void;
  setSelectedDate: (date: Date) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setPlaces(StorageService.getPlaces());
    setAreas(StorageService.getAreas());
    setAvailabilityRules(StorageService.getAvailabilityRules());
    setBookedSlots(StorageService.getBookedSlots());
  };

  // Place operations
  const addPlace = (place: Omit<Place, 'id'>) => {
    const newPlace = StorageService.addPlace(place);
    refreshData();
    return newPlace;
  };

  const updatePlace = (place: Place) => {
    StorageService.updatePlace(place);
    refreshData();
  };

  const deletePlace = (placeId: string) => {
    StorageService.deletePlace(placeId);
    refreshData();
  };

  // Area operations
  const addArea = (area: Area) => {
    StorageService.addArea(area);
    refreshData();
  };

  const updateArea = (area: Area) => {
    StorageService.updateArea(area);
    refreshData();
  };

  const deleteArea = (areaName: string) => {
    StorageService.deleteArea(areaName);
    refreshData();
  };

  // Availability Rule operations
  const addAvailabilityRule = (rule: Omit<AvailabilityRule, 'id'>) => {
    const newRule = StorageService.addAvailabilityRule(rule);
    refreshData();
    return newRule;
  };

  const updateAvailabilityRule = (rule: AvailabilityRule) => {
    StorageService.updateAvailabilityRule(rule);
    refreshData();
  };

  const deleteAvailabilityRule = (ruleId: string) => {
    StorageService.deleteAvailabilityRule(ruleId);
    refreshData();
  };

  // Booked Slot operations
  const addBookedSlot = (slot: Omit<BookedSlot, 'id'>) => {
    const newSlot = StorageService.addBookedSlot(slot);
    refreshData();
    return newSlot;
  };

  const updateBookedSlot = (slot: BookedSlot) => {
    StorageService.updateBookedSlot(slot);
    refreshData();
  };

  const deleteBookedSlot = (slotId: string) => {
    StorageService.deleteBookedSlot(slotId);
    refreshData();
  };

  const value = {
    places,
    areas,
    availabilityRules,
    bookedSlots,
    selectedPlace,
    selectedDate,
    refreshData,
    addPlace,
    updatePlace,
    deletePlace,
    addArea,
    updateArea,
    deleteArea,
    addAvailabilityRule,
    updateAvailabilityRule,
    deleteAvailabilityRule,
    addBookedSlot,
    updateBookedSlot,
    deleteBookedSlot,
    setSelectedPlace,
    setSelectedDate
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
