import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import PlaceSelector from './PlaceSelector';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';

const BookingPage: React.FC = () => {
  const { selectedPlace } = useAppContext();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Smart Calendar Booking
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
