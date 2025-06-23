import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Grid,
  Alert,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { format, parse } from 'date-fns';
import { useAppContext } from '../../contexts/AppContext';
import { TimeSlot } from '../../models/types';

interface BookingFormProps {
  slot: TimeSlot;
  onBack: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ slot, onBack }) => {
  const { selectedPlaceId, places, selectedDate, addBookedSlot } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Find the selected place using the selectedPlaceId
  const selectedPlace = selectedPlaceId ? places.find(place => place.id === selectedPlaceId) : null;
  
  // Convert the selectedDate string to a Date object if it's a string
  const selectedDateObj = selectedDate ? 
    (typeof selectedDate === 'string' ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : selectedDate) : 
    null;
  
  if (!selectedPlace || !selectedDate) {
    return null;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      placeId: selectedPlace.id,
      date: selectedDate, // Store the date as it is in the context
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
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4} sm={3}>
            <Typography variant="body1" fontWeight="bold">Location:</Typography>
          </Grid>
          <Grid item xs={8} sm={9}>
            <Typography variant="body1">{selectedPlace.name}</Typography>
          </Grid>
          
          <Grid item xs={4} sm={3}>
            <Typography variant="body1" fontWeight="bold">Date:</Typography>
          </Grid>
          <Grid item xs={8} sm={9}>
            <Typography variant="body1">{selectedDateObj ? format(selectedDateObj, 'EEEE, MMM dd, yyyy') : ''}</Typography>
          </Grid>
          
          <Grid item xs={4} sm={3}>
            <Typography variant="body1" fontWeight="bold">Time:</Typography>
          </Grid>
          <Grid item xs={8} sm={9}>
            <Typography variant="body1">{slot.startTime} - {slot.endTime}</Typography>
          </Grid>
          
          <Grid item xs={4} sm={3}>
            <Typography variant="body1" fontWeight="bold">Name:</Typography>
          </Grid>
          <Grid item xs={8} sm={9}>
            <Typography variant="body1">{name}</Typography>
          </Grid>
          
          <Grid item xs={4} sm={3}>
            <Typography variant="body1" fontWeight="bold">Email:</Typography>
          </Grid>
          <Grid item xs={8} sm={9}>
            <Typography variant="body1">{email}</Typography>
          </Grid>
        </Grid>
        
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
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" fontWeight="bold">Location:</Typography>
          <Typography variant="body1">{selectedPlace.name}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" fontWeight="bold">Area:</Typography>
          <Typography variant="body1">{selectedPlace.area}</Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" fontWeight="bold">Date:</Typography>
          <Typography variant="body1">{selectedDateObj ? format(selectedDateObj, 'EEEE, MMM dd, yyyy') : ''}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body1" fontWeight="bold">Time:</Typography>
          <Typography variant="body1">{slot.startTime} - {slot.endTime}</Typography>
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            label="Your Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid>
      </Grid>
      
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

export default BookingForm;
