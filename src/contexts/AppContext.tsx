import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Place, Area, AvailabilityRule, BookedSlot } from '../models/types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import * as firebaseDataService from '../services/firebaseDataService';
import { getUserProfileByUsername } from '../services/authService';

interface AppContextType {
  places: Place[];
  areas: Area[];
  availabilityRules: AvailabilityRule[];
  bookedSlots: BookedSlot[];
  selectedPlaceId: string | null;
  selectedDate: string | null;
  addPlace: (place: Omit<Place, 'id'>) => Promise<Place>;
  updatePlace: (place: Place) => Promise<void>;
  deletePlace: (placeId: string) => Promise<void>;
  addArea: (area: Area) => Promise<Area>;
  updateArea: (area: Area) => Promise<void>;
  deleteArea: (areaName: string) => Promise<void>;
  addAvailabilityRule: (rule: Omit<AvailabilityRule, 'id'>) => Promise<AvailabilityRule>;
  updateAvailabilityRule: (rule: AvailabilityRule) => Promise<void>;
  deleteAvailabilityRule: (ruleId: string) => Promise<void>;
  addBookedSlot: (slot: Omit<BookedSlot, 'id'>) => Promise<BookedSlot>;
  deleteBookedSlot: (slotId: string) => Promise<void>;
  setSelectedPlaceId: (placeId: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  currentUser: any;
  loading: boolean;
  calendarOwnerId: string | null;
  setCalendarOwnerId: (id: string | null) => void;
  calendarOwnerUsername: string | null;
  setCalendarOwnerUsername: (username: string | null) => void;
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
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calendarOwnerId, setCalendarOwnerId] = useState<string | null>(null);
  const [calendarOwnerUsername, setCalendarOwnerUsername] = useState<string | null>(null);
  
  // Get the currently authenticated user
  const [currentUser, loading, error] = useAuthState(auth);

  const userId = calendarOwnerId || currentUser?.uid;

  // Load data based on the calendar owner or current user
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;

      try {
        const fetchedPlaces = await firebaseDataService.getPlaces(userId);
        setPlaces(fetchedPlaces);
        
        const fetchedAreas = await firebaseDataService.getAreas(userId);
        setAreas(fetchedAreas);
        
        const fetchedRules = await firebaseDataService.getAvailabilityRules(userId);
        setAvailabilityRules(fetchedRules);
        
        const fetchedSlots = await firebaseDataService.getBookedSlots(userId);
        setBookedSlots(fetchedSlots);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [userId]);

  // Load data when a username is specified (for public viewing)
  useEffect(() => {
    const loadUserByUsername = async () => {
      if (!calendarOwnerUsername) return;

      try {
        const userProfile = await getUserProfileByUsername(calendarOwnerUsername);
        if (userProfile) {
          setCalendarOwnerId(userProfile.uid);
        }
      } catch (error) {
        console.error('Error loading user by username:', error);
      }
    };

    loadUserByUsername();
  }, [calendarOwnerUsername]);

  const addPlace = async (place: Omit<Place, 'id'>): Promise<Place> => {
    if (!userId) throw new Error('User not authenticated');
    const newPlace = await firebaseDataService.addPlace(userId, place);
    setPlaces([...places, newPlace]);
    return newPlace;
  };

  const updatePlace = async (place: Place): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.updatePlace(userId, place);
    setPlaces(places.map(p => p.id === place.id ? place : p));
  };

  const deletePlace = async (placeId: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.deletePlace(userId, placeId);
    setPlaces(places.filter(p => p.id !== placeId));
  };

  const addArea = async (area: Area): Promise<Area> => {
    if (!userId) throw new Error('User not authenticated');
    const newArea = await firebaseDataService.addArea(userId, area);
    setAreas([...areas, newArea]);
    return newArea;
  };

  const updateArea = async (area: Area): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.updateArea(userId, area);
    setAreas(areas.map(a => a.name === area.name ? area : a));
  };

  const deleteArea = async (areaName: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.deleteArea(userId, areaName);
    setAreas(areas.filter(a => a.name !== areaName));
  };

  const addAvailabilityRule = async (rule: Omit<AvailabilityRule, 'id'>): Promise<AvailabilityRule> => {
    if (!userId) throw new Error('User not authenticated');
    const newRule = await firebaseDataService.addAvailabilityRule(userId, rule);
    setAvailabilityRules([...availabilityRules, newRule]);
    return newRule;
  };

  const updateAvailabilityRule = async (rule: AvailabilityRule): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.updateAvailabilityRule(userId, rule);
    setAvailabilityRules(availabilityRules.map(r => r.id === rule.id ? rule : r));
  };

  const deleteAvailabilityRule = async (ruleId: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.deleteAvailabilityRule(userId, ruleId);
    setAvailabilityRules(availabilityRules.filter(r => r.id !== ruleId));
  };

  const addBookedSlot = async (slot: Omit<BookedSlot, 'id'>): Promise<BookedSlot> => {
    if (!userId) throw new Error('User not authenticated');
    const newSlot = await firebaseDataService.addBookedSlot(userId, slot);
    setBookedSlots([...bookedSlots, newSlot]);
    return newSlot;
  };

  const deleteBookedSlot = async (slotId: string): Promise<void> => {
    if (!userId) throw new Error('User not authenticated');
    await firebaseDataService.deleteBookedSlot(userId, slotId);
    setBookedSlots(bookedSlots.filter(s => s.id !== slotId));
  };

  return (
    <AppContext.Provider value={{
      places,
      areas,
      availabilityRules,
      bookedSlots,
      selectedPlaceId,
      selectedDate,
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
      deleteBookedSlot,
      setSelectedPlaceId,
      setSelectedDate,
      currentUser,
      loading,
      calendarOwnerId,
      setCalendarOwnerId,
      calendarOwnerUsername,
      setCalendarOwnerUsername
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
