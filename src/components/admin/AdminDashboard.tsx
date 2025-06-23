import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Container, Paper } from '@mui/material';
import { useAppContext } from '../../contexts/AppContext';
import PlacesManager from './PlacesManager';
import AvailabilityRulesManager from './AvailabilityRulesManager';
import BookedSlotsManager from './BookedSlotsManager';

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
  const { refreshData } = useAppContext();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
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
