import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import PlacesManager from './PlacesManager';
import AvailabilityRulesManager from './AvailabilityRulesManager';
import BookedSlotsManager from './BookedSlotsManager';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const AdminDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { username } = useParams<{ username: string }>();
  const [user, authLoading] = useAuthState(auth);
  const { 
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Show loading state while authentication or data is loading
  if (authLoading || loading || (username && !calendarOwnerId)) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {username ? `${username}'s Calendar Admin` : 'Admin Dashboard'}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Manage places, availability rules, and view booked slots.
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
              <Tab label="Places" {...a11yProps(0)} />
              <Tab label="Availability Rules" {...a11yProps(1)} />
              <Tab label="Booked Slots" {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <PlacesManager />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <AvailabilityRulesManager />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <BookedSlotsManager />
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
