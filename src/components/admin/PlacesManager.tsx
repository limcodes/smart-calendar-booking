import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { Area, Place } from '../../models/types';

const PlacesManager: React.FC = () => {
  const { places, areas, addPlace, updatePlace, deletePlace, addArea, updateArea } = useAppContext();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [travelBufferMinutes, setTravelBufferMinutes] = useState('30');

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setPlaceName('');
    setAreaName('');
    setTravelBufferMinutes('30');
    setCurrentPlace(null);
  };

  const handleEdit = (place: Place) => {
    setCurrentPlace(place);
    setPlaceName(place.name);
    setAreaName(place.area);
    const area = areas.find(a => a.name === place.area);
    setTravelBufferMinutes(area ? area.travelBufferMinutes.toString() : '30');
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!placeName || !areaName || !travelBufferMinutes) return;

    // Find or create area
    const existingArea = areas.find(area => area.name === areaName);
    const areaToSave: Area = {
      name: areaName,
      travelBufferMinutes: parseInt(travelBufferMinutes, 10) || 30
    };

    if (existingArea) {
      updateArea(areaToSave);
    } else {
      addArea(areaToSave);
    }

    if (editMode && currentPlace) {
      updatePlace({
        ...currentPlace,
        name: placeName,
        area: areaName
      });
    } else {
      addPlace({
        name: placeName,
        area: areaName
      });
    }

    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this place?')) {
      deletePlace(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Places</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Place
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Area</TableCell>
              <TableCell>Travel Buffer (min)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {places.map((place) => {
              const area = areas.find(a => a.name === place.area);
              return (
                <TableRow key={place.id}>
                  <TableCell>{place.name}</TableCell>
                  <TableCell>{place.area}</TableCell>
                  <TableCell>{area ? area.travelBufferMinutes : 'Not set'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(place)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(place.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {places.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No places added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Place' : 'Add New Place'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Place Name"
                fullWidth
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Area"
                fullWidth
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Travel Buffer (minutes)"
                type="number"
                fullWidth
                value={travelBufferMinutes}
                onChange={(e) => setTravelBufferMinutes(e.target.value)}
                helperText="Buffer time for travel within the same area"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlacesManager;
