import React, { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { format, parseISO } from 'date-fns';

const BookedSlotsManager: React.FC = () => {
  const { bookedSlots, places, deleteBookedSlot } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBookedSlot(id);
    }
  };

  // Filter booked slots based on search term
  const filteredBookedSlots = bookedSlots.filter(slot => 
    slot.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    places.find(p => p.id === slot.placeId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort booked slots by date and time
  const sortedBookedSlots = [...filteredBookedSlots].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}`);
    const dateB = new Date(`${b.date}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const getPlaceName = (placeId: string): string => {
    const place = places.find(p => p.id === placeId);
    return place ? place.name : 'Unknown Place';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Booked Slots</Typography>
        <TextField
          size="small"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Place</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBookedSlots.map((slot) => (
              <TableRow key={slot.id}>
                <TableCell>
                  {format(parseISO(slot.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {slot.startTime} - {slot.endTime}
                </TableCell>
                <TableCell>{getPlaceName(slot.placeId)}</TableCell>
                <TableCell>{slot.customerName}</TableCell>
                <TableCell>{slot.customerEmail}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDelete(slot.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {sortedBookedSlots.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {searchTerm ? 'No bookings found matching your search' : 'No bookings yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BookedSlotsManager;
