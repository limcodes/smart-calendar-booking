import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';

const HomePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          mb: 4,
          backgroundImage: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Smart Calendar Booking
              </Typography>
              <Typography variant="h5" paragraph>
                Create your own booking calendar with smart buffer times for travel between appointments.
              </Typography>
              {!user ? (
                <Box sx={{ mt: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    color="secondary"
                    onClick={() => navigate('/signup')}
                    sx={{ mr: 2 }}
                  >
                    Create Your Calendar
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'white' }}
                  >
                    Log In
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mt: 4 }}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    color="secondary"
                    onClick={() => navigate(`/${user.displayName?.split(' ')[0].toLowerCase() || 'calendar'}/admin`)}
                  >
                    Manage My Calendar
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ 
                height: 350, 
                backgroundColor: 'rgba(255,255,255,0.1)', 
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Calendar illustration or screenshot could go here */}
                <Typography variant="h4">Calendar Preview</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Smart Buffer Times
                </Typography>
                <Typography variant="body1">
                  Automatically calculate travel time between locations to ensure your schedule is realistic and manageable.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Multiple Locations
                </Typography>
                <Typography variant="body1">
                  Manage availability across different places, with custom settings for each location.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  Custom Availability
                </Typography>
                <Typography variant="body1">
                  Set up rules for when you're available, with options for recurring schedules.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* How it works section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            How It Works
          </Typography>
          <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.paper' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    1. Sign Up
                  </Typography>
                  <Typography>
                    Create your account and get your personal booking URL.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    2. Set Up Your Calendar
                  </Typography>
                  <Typography>
                    Add locations, availability rules, and buffer times.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h6" gutterBottom>
                    3. Share Your Link
                  </Typography>
                  <Typography>
                    Let people book appointments through your custom URL.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* Call to action */}
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Ready to streamline your scheduling?
        </Typography>
        <Typography variant="body1" paragraph>
          Join thousands of professionals who save time with Smart Calendar Booking.
        </Typography>
        {!user ? (
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/signup')}
          >
            Sign Up Now - It's Free!
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate(`/${user.displayName?.split(' ')[0].toLowerCase() || 'calendar'}/admin`)}
          >
            Go to My Dashboard
          </Button>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
