import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Grid,
  Button,
  IconButton
} from '@mui/material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday, 
  isSameMonth,
  addMonths,
  subMonths,
  isSameDay,
  parse
} from 'date-fns';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { getDaysWithAvailability } from '../../utils/timeUtils';

const DateSelector: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { selectedPlaceId, places, selectedDate, setSelectedDate } = useAppContext();
  
  // Find the selected place using the selectedPlaceId
  const selectedPlace = selectedPlaceId ? places.find(place => place.id === selectedPlaceId) : null;
  
  // Convert selectedDate string to Date object when needed for date-fns functions
  const selectedDateObj = selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : null;
  
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDateClick = (day: Date) => {
    // Convert the Date object to a string in 'yyyy-MM-dd' format before setting it
    setSelectedDate(format(day, 'yyyy-MM-dd'));
  };
  
  // Fetch available days when month or place changes
  useEffect(() => {
    const fetchAvailableDays = async () => {
      if (selectedPlace) {
        setIsLoading(true);
        try {
          const days = await getDaysWithAvailability(selectedPlace.id, currentMonth);
          setAvailableDays(days);
        } catch (error) {
          console.error('Error fetching available days:', error);
          setAvailableDays([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAvailableDays([]);
      }
    };
    
    fetchAvailableDays();
  }, [selectedPlace, currentMonth]);

  if (!selectedPlace) {
    return null;
  }

  // Get the start of the month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Get the day of week of the first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = monthStart.getDay();
  
  // Get all days in the month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Generate calendar grid including previous month days to align correctly
  const calendarDays: (Date | null)[] = [];
  
  // Add empty slots for days from previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of current month
  daysInMonth.forEach(day => {
    calendarDays.push(day);
  });
  
  const isDayAvailable = (day: Date | null) => {
    if (!day) return false;
    return availableDays.some((availableDay: Date) => isSameDay(availableDay, day));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, position: 'relative' }}>
        {isLoading && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            p: 1,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1
          }}>
            <Typography variant="body2" color="primary">Loading available days...</Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Select a Date
          </Typography>
          <Box>
            <IconButton onClick={handlePrevMonth}>
              <ChevronLeft />
            </IconButton>
            <Typography variant="h6" component="span" sx={{ mx: 2 }}>
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={handleNextMonth}>
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
        
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid key={day} sx={{ width: `${100/7}%` }}>
              <Typography 
                variant="subtitle1" 
                align="center" 
                sx={{ fontWeight: 'bold' }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>
        
        <Grid container spacing={1}>
          {calendarDays.map((day, index) => {
            if (day === null) {
              // Empty cell for previous month days
              return (
                <Grid key={`empty-${index}`} sx={{ width: `${100/7}%`, padding: '4px' }}>
                  <Box sx={{ height: '40px' }} />
                </Grid>
              );
            }
            
            const isAvailable = isDayAvailable(day);
            const isSelected = selectedDateObj ? isSameDay(day, selectedDateObj) : false;
            
            return (
              <Grid key={day.toString()} sx={{ width: `${100/7}%`, padding: '4px' }}>
                <Button
                  fullWidth
                  variant={isSelected ? "contained" : "outlined"}
                  color={isSelected ? "primary" : isAvailable ? "primary" : "inherit"}
                  sx={{
                    height: '40px',
                    backgroundColor: isSelected 
                      ? 'primary.main' 
                      : isAvailable 
                        ? 'rgba(25, 118, 210, 0.08)' 
                        : 'transparent',
                    color: isAvailable 
                      ? isSelected 
                        ? 'white' 
                        : 'primary.main' 
                      : 'text.disabled',
                    border: isAvailable && !isSelected 
                      ? '1px solid rgba(25, 118, 210, 0.5)' 
                      : '1px solid rgba(0, 0, 0, 0.12)',
                    '&.Mui-disabled': {
                      color: 'text.disabled'
                    }
                  }}
                  disabled={!isAvailable}
                  onClick={() => isAvailable && handleDateClick(day)}
                >
                  {format(day, 'd')}
                </Button>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
          <Box sx={{ 
            width: '12px', 
            height: '12px', 
            bgcolor: 'rgba(25, 118, 210, 0.08)', 
            border: '1px solid rgba(25, 118, 210, 0.5)', 
            mr: 1 
          }} />
          <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
            Available
          </Typography>
          
          <Box sx={{ 
            width: '12px', 
            height: '12px', 
            bgcolor: 'primary.main', 
            mr: 1 
          }} />
          <Typography variant="body2" color="textSecondary">
            Selected
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DateSelector;
