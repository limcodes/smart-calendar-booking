import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Place, Area, AvailabilityRule, BookedSlot } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to convert Firestore timestamps to Date objects
const convertTimestamps = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] && typeof newObj[key] === 'object' && newObj[key].toDate) {
      newObj[key] = newObj[key].toDate();
    } else if (newObj[key] && typeof newObj[key] === 'object') {
      newObj[key] = convertTimestamps(newObj[key]);
    }
  });
  return newObj;
};

// Places
export const addPlace = async (userId: string, place: Omit<Place, 'id'>): Promise<Place> => {
  try {
    const newPlace = { ...place, id: uuidv4() } as Place;
    await setDoc(doc(db, `users/${userId}/places/${newPlace.id}`), newPlace);
    return newPlace;
  } catch (error) {
    console.error('Error adding place:', error);
    throw error;
  }
};

export const updatePlace = async (userId: string, place: Place): Promise<void> => {
  try {
    await updateDoc(doc(db, `users/${userId}/places/${place.id}`), { ...place });
  } catch (error) {
    console.error('Error updating place:', error);
    throw error;
  }
};

export const deletePlace = async (userId: string, placeId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `users/${userId}/places/${placeId}`));
  } catch (error) {
    console.error('Error deleting place:', error);
    throw error;
  }
};

export const getPlaces = async (userId: string): Promise<Place[]> => {
  try {
    const placesRef = collection(db, `users/${userId}/places`);
    const placesSnap = await getDocs(placesRef);
    const places: Place[] = [];
    
    placesSnap.forEach((placeDoc: QueryDocumentSnapshot<DocumentData>) => {
      places.push(placeDoc.data() as Place);
    });
    
    return places;
  } catch (error) {
    console.error('Error getting places:', error);
    throw error;
  }
};

// Areas
export const addArea = async (userId: string, area: Area): Promise<Area> => {
  try {
    await setDoc(doc(db, `users/${userId}/areas/${area.name}`), area);
    return area;
  } catch (error) {
    console.error('Error adding area:', error);
    throw error;
  }
};

export const updateArea = async (userId: string, area: Area): Promise<void> => {
  try {
    await updateDoc(doc(db, `users/${userId}/areas/${area.name}`), { ...area });
  } catch (error) {
    console.error('Error updating area:', error);
    throw error;
  }
};

export const deleteArea = async (userId: string, areaName: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `users/${userId}/areas/${areaName}`));
  } catch (error) {
    console.error('Error deleting area:', error);
    throw error;
  }
};

export const getAreas = async (userId: string): Promise<Area[]> => {
  try {
    const areasRef = collection(db, `users/${userId}/areas`);
    const areasSnap = await getDocs(areasRef);
    const areas: Area[] = [];
    
    areasSnap.forEach((areaDoc: QueryDocumentSnapshot<DocumentData>) => {
      areas.push(areaDoc.data() as Area);
    });
    
    return areas;
  } catch (error) {
    console.error('Error getting areas:', error);
    throw error;
  }
};

// Availability Rules
export const addAvailabilityRule = async (userId: string, rule: Omit<AvailabilityRule, 'id'>): Promise<AvailabilityRule> => {
  try {
    const newRule = { ...rule, id: uuidv4() } as AvailabilityRule;
    await setDoc(doc(db, `users/${userId}/availabilityRules/${newRule.id}`), newRule);
    return newRule;
  } catch (error) {
    console.error('Error adding availability rule:', error);
    throw error;
  }
};

export const updateAvailabilityRule = async (userId: string, rule: AvailabilityRule): Promise<void> => {
  try {
    await updateDoc(doc(db, `users/${userId}/availabilityRules/${rule.id}`), { ...rule });
  } catch (error) {
    console.error('Error updating availability rule:', error);
    throw error;
  }
};

export const deleteAvailabilityRule = async (userId: string, ruleId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `users/${userId}/availabilityRules/${ruleId}`));
  } catch (error) {
    console.error('Error deleting availability rule:', error);
    throw error;
  }
};

export const getAvailabilityRules = async (userId: string): Promise<AvailabilityRule[]> => {
  try {
    const rulesRef = collection(db, `users/${userId}/availabilityRules`);
    const rulesSnap = await getDocs(rulesRef);
    const rules: AvailabilityRule[] = [];
    
    rulesSnap.forEach((ruleDoc: QueryDocumentSnapshot<DocumentData>) => {
      rules.push(ruleDoc.data() as AvailabilityRule);
    });
    
    return rules;
  } catch (error) {
    console.error('Error getting availability rules:', error);
    throw error;
  }
};

// Booked Slots
export const addBookedSlot = async (userId: string, bookedSlot: Omit<BookedSlot, 'id'>): Promise<BookedSlot> => {
  try {
    const newBookedSlot = { ...bookedSlot, id: uuidv4() } as BookedSlot;
    await setDoc(doc(db, `users/${userId}/bookedSlots/${newBookedSlot.id}`), newBookedSlot);
    return newBookedSlot;
  } catch (error) {
    console.error('Error adding booked slot:', error);
    throw error;
  }
};

export const updateBookedSlot = async (userId: string, bookedSlot: BookedSlot): Promise<void> => {
  try {
    await updateDoc(doc(db, `users/${userId}/bookedSlots/${bookedSlot.id}`), { ...bookedSlot });
  } catch (error) {
    console.error('Error updating booked slot:', error);
    throw error;
  }
};

export const deleteBookedSlot = async (userId: string, bookedSlotId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `users/${userId}/bookedSlots/${bookedSlotId}`));
  } catch (error) {
    console.error('Error deleting booked slot:', error);
    throw error;
  }
};

export const getBookedSlots = async (userId: string): Promise<BookedSlot[]> => {
  try {
    const slotsRef = collection(db, `users/${userId}/bookedSlots`);
    const slotsSnap = await getDocs(slotsRef);
    const slots: BookedSlot[] = [];
    
    slotsSnap.forEach((slotDoc: QueryDocumentSnapshot<DocumentData>) => {
      slots.push(convertTimestamps(slotDoc.data()) as BookedSlot);
    });
    
    return slots;
  } catch (error) {
    console.error('Error getting booked slots:', error);
    throw error;
  }
};

// Get booked slots for a specific date
export const getBookedSlotsByDate = async (userId: string, date: string): Promise<BookedSlot[]> => {
  try {
    const slotsRef = collection(db, `users/${userId}/bookedSlots`);
    const q = query(slotsRef, where("date", "==", date), orderBy("startTime"));
    const slotsSnap = await getDocs(q);
    const slots: BookedSlot[] = [];
    
    slotsSnap.forEach((slotDoc: QueryDocumentSnapshot<DocumentData>) => {
      slots.push(convertTimestamps(slotDoc.data()) as BookedSlot);
    });
    
    return slots;
  } catch (error) {
    console.error('Error getting booked slots by date:', error);
    throw error;
  }
};

// Get booked slots for a specific place
export const getBookedSlotsByPlace = async (userId: string, placeId: string): Promise<BookedSlot[]> => {
  try {
    const slotsRef = collection(db, `users/${userId}/bookedSlots`);
    const q = query(slotsRef, where("placeId", "==", placeId));
    const slotsSnap = await getDocs(q);
    const slots: BookedSlot[] = [];
    
    slotsSnap.forEach((slotDoc: QueryDocumentSnapshot<DocumentData>) => {
      slots.push(convertTimestamps(slotDoc.data()) as BookedSlot);
    });
    
    return slots;
  } catch (error) {
    console.error('Error getting booked slots by place:', error);
    throw error;
  }
};
