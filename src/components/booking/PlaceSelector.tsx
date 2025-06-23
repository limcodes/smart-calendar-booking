import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Paper, 
  Container,
  SelectChangeEvent
} from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';

const PlaceSelector: React.FC = () => {
  const { places, selectedPlaceId, setSelectedPlaceId } = useAppContext();

  const handleChange = (event: SelectChangeEvent) => {
    const selectedId = event.target.value;
    setSelectedPlaceId(selectedId);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Select a Location
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please choose a location to see available booking slots.
        </Typography>
        
        {places.length === 0 ? (
          <Typography color="error">
            No locations available. Please check back later.
          </Typography>
        ) : (
          <Box sx={{ minWidth: 200, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="place-select-label">Location</InputLabel>
              <Select
                labelId="place-select-label"
                id="place-select"
                value={selectedPlaceId || ''}
                label="Location"
                onChange={handleChange}
              >
                {places.map((place) => (
                  <MenuItem key={place.id} value={place.id}>
                    {place.name} ({place.area})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PlaceSelector;
