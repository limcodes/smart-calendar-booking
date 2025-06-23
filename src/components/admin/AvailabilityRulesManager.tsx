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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';
import { AvailabilityRule } from '../../models/types';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const AvailabilityRulesManager: React.FC = () => {
  const { availabilityRules, addAvailabilityRule, updateAvailabilityRule, deleteAvailabilityRule } = useAppContext();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRule, setCurrentRule] = useState<AvailabilityRule | null>(null);
  
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Default to Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleOpen = () => {
    setOpen(true);
    setEditMode(false);
    setDayOfWeek(1);
    setStartTime('09:00');
    setEndTime('17:00');
    setCurrentRule(null);
  };

  const handleEdit = (rule: AvailabilityRule) => {
    setCurrentRule(rule);
    setDayOfWeek(rule.dayOfWeek);
    setStartTime(rule.startTime);
    setEndTime(rule.endTime);
    setEditMode(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    if (editMode && currentRule) {
      updateAvailabilityRule({
        ...currentRule,
        dayOfWeek,
        startTime,
        endTime
      });
    } else {
      addAvailabilityRule({
        dayOfWeek,
        startTime,
        endTime
      });
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteAvailabilityRule(id);
    }
  };

  const validateTimeFields = (): boolean => {
    if (!startTime || !endTime) return false;
    
    const startParts = startTime.split(':').map(Number);
    const endParts = endTime.split(':').map(Number);
    
    if (startParts.length !== 2 || endParts.length !== 2) return false;
    
    const [startHour, startMinute] = startParts;
    const [endHour, endMinute] = endParts;
    
    if (
      startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59 ||
      endHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59
    ) {
      return false;
    }
    
    // Check if end time is after start time
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      return false;
    }
    
    return true;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Availability Rules</Typography>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Rule
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availabilityRules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  {DAYS_OF_WEEK.find(day => day.value === rule.dayOfWeek)?.label || 'Unknown'}
                </TableCell>
                <TableCell>{rule.startTime}</TableCell>
                <TableCell>{rule.endTime}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(rule)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(rule.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {availabilityRules.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No availability rules added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                <Select
                  labelId="day-of-week-label"
                  value={dayOfWeek}
                  label="Day of Week"
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Time (HH:MM)"
                fullWidth
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="10:00"
                error={!!(startTime && !startTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/))}
                helperText={startTime && !startTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/) ? 'Invalid time format' : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time (HH:MM)"
                fullWidth
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="18:00"
                error={!!(endTime && !endTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/))}
                helperText={endTime && !endTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/) ? 'Invalid time format' : ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!validateTimeFields()}
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvailabilityRulesManager;
