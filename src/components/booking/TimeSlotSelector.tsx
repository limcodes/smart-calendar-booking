import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Grid,
  Button,
  Divider,
  Alert,
  TextField,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import { useAppContext } from '../../contexts/AppContext';
import { getAvailableSlots } from '../../utils/timeUtils';
import { TimeSlot } from '../../models/types';
// We'll define BookingForm in this file to resolve circular dependencies
interface BookingFormProps {
  slot: TimeSlot;
  onBack: () => void;
}

// Simple inline implementation of BookingForm component
const BookingFormComponent: React.FC<BookingFormProps> = ({ slot, onBack }) => {
  const { selectedPlaceId, places, selectedDate, addBookedSlot } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Find the selected place using the selectedPlaceId
  const selectedPlace = selectedPlaceId ? places.find(place => place.id === selectedPlaceId) : null;
  
  // Convert selectedDate string to Date object when needed for date-fns functions
  const selectedDateObj = selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : null;
  
  if (!selectedPlace || !selectedDate) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      placeId: selectedPlace.id,
      date: selectedDate, // Keep the date in the format stored in context
      startTime: slot.startTime,
      endTime: slot.endTime,
      customerName: name,
      customerEmail: email
    };
    
    addBookedSlot(bookingData);
    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your booking has been confirmed!
        </Alert>
        
        <Typography variant="h6" gutterBottom>
          Booking Details
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">Location:</Typography>
          <Typography variant="body1">{selectedPlace.name}</Typography>
          
          <Typography variant="body1" fontWeight="bold">Date:</Typography>
          <Typography variant="body1">{selectedDateObj ? format(selectedDateObj, 'EEEE, MMM dd, yyyy') : ''}</Typography>
          
          <Typography variant="body1" fontWeight="bold">Time:</Typography>
          <Typography variant="body1">{slot.startTime} - {slot.endTime}</Typography>
          
          <Typography variant="body1" fontWeight="bold">Name:</Typography>
          <Typography variant="body1">{name}</Typography>
          
          <Typography variant="body1" fontWeight="bold">Email:</Typography>
          <Typography variant="body1">{email}</Typography>
        </Box>
        
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          fullWidth
        >
          Book Another Slot
        </Button>
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h2">
          Complete Your Booking
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" fontWeight="bold">Location:</Typography>
        <Typography variant="body1">{selectedPlace.name}</Typography>
        
        <Typography variant="body1" fontWeight="bold">Area:</Typography>
        <Typography variant="body1">{selectedPlace.area}</Typography>
        
        <Typography variant="body1" fontWeight="bold">Date:</Typography>
        <Typography variant="body1">{selectedDateObj ? format(selectedDateObj, 'EEEE, MMM dd, yyyy') : ''}</Typography>
        
        <Typography variant="body1" fontWeight="bold">Time:</Typography>
        <Typography variant="body1">{slot.startTime} - {slot.endTime}</Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Your Name"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email Address"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={onBack}
          sx={{ minWidth: '100px' }}
        >
          Back
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          sx={{ minWidth: '100px' }}
        >
          Book Now
        </Button>
      </Box>
    </Box>
  );
};

const TimeSlotSelector: React.FC = () => {
  const { selectedPlaceId, places, selectedDate } = useAppContext();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Find the selected place using the selectedPlaceId
  const selectedPlace = selectedPlaceId ? places.find(place => place.id === selectedPlaceId) : null;
  
  // Convert selectedDate string to Date object when needed for date-fns functions
  const selectedDateObj = selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : null;
  
  useEffect(() => {
    if (selectedPlace && selectedDate && selectedDateObj) {
      // Pass selectedPlace.id and selectedDateObj (Date object) to getAvailableSlots
      const slots = getAvailableSlots(selectedPlace.id, selectedDateObj);
      setAvailableSlots(slots);
      setSelectedSlot(null);
      setIsFormOpen(false);
    }
  }, [selectedPlace, selectedDate, selectedDateObj]);
  
  if (!selectedPlace || !selectedDate) {
    return null;
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsFormOpen(true);
  };

  const handleBackToSlots = () => {
    setIsFormOpen(false);
  };

  const formatSlotTime = (slot: TimeSlot) => {
    return `${slot.startTime} - ${slot.endTime}`;
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {isFormOpen && selectedSlot ? (
          <BookingFormComponent 
            slot={selectedSlot} 
            onBack={handleBackToSlots} 
          />
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Available Time Slots
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {selectedPlace.name} ({selectedPlace.area}) - {selectedDateObj ? format(selectedDateObj, 'EEEE, MMM dd, yyyy') : ''}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>

            {availableSlots.length === 0 ? (
              <Alert severity="info">
                No available slots for this date. Please select another date.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: '-8px' }}>
                {availableSlots.filter(slot => slot.isAvailable).map((slot, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      width: { xs: '100%', sm: '50%', md: '33.33%' },
                      padding: '8px'
                    }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleSlotSelect(slot)}
                      sx={{ 
                        py: 1.5, 
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white'
                        }
                      }}
                    >
                      {formatSlotTime(slot)}
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default TimeSlotSelector;
