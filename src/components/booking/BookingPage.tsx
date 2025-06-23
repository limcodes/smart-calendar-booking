import React, { useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import PlaceSelector from './PlaceSelector';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import { useParams } from 'react-router-dom';
import { getUserProfileByUsername } from '../../services/authService';

const BookingPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { 
    selectedPlaceId, 
    places, 
    setCalendarOwnerUsername,
    loading,
    calendarOwnerId
  } = useAppContext();
  
  // Set the calendar owner username in context when this component mounts
  useEffect(() => {
    if (username) {
      setCalendarOwnerUsername(username);
    }
  }, [username, setCalendarOwnerUsername]);
  
  // Find the selected place object using the selectedPlaceId
  const selectedPlace = selectedPlaceId ? places.find(place => place.id === selectedPlaceId) : null;
  
  if (loading || (username && !calendarOwnerId)) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {username ? `${username}'s Calendar` : 'Smart Calendar Booking'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Book your appointment with smart travel buffer time
        </Typography>
      </Box>
      
      <PlaceSelector />
      
      {selectedPlace && (
        <>
          <DateSelector />
          <TimeSlotSelector />
        </>
      )}
    </Container>
  );
};

export default BookingPage;
