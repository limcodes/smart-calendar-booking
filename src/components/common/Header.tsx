import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, Avatar, IconButton } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../config/firebase';
import { signOut } from '../../services/authService';
import { useAppContext } from '../../contexts/AppContext';
import { doc, getDoc } from 'firebase/firestore';

const Header: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const { username } = useParams<{ username?: string }>();
  const { calendarOwnerUsername } = useAppContext();
  const [userUsername, setUserUsername] = useState<string | null>(null);
  
  // Menu state for user dropdown
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Fetch the current user's username from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserUsername(userData.username);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserUsername(null);
      }
    };

    fetchUserData();
  }, [user]);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
    navigate('/');
  };

  // For display in the header title
  const displayUsername = username || calendarOwnerUsername;
  
  // For user-specific navigation to their own admin dashboard
  const navigateToAdmin = () => {
    if (userUsername) {
      navigate(`/${userUsername}/admin`);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {displayUsername ? `${displayUsername}'s Calendar` : 'Smart Calendar Booking'}
        </Typography>
        
        {/* Navigation options when viewing someone else's calendar */}
        {displayUsername && (
          <Button 
            color="inherit" 
            component={Link} 
            to={`/${displayUsername}`}
            sx={{ mr: 1 }}
          >
            Book Appointment
          </Button>
        )}
        
        {/* User authentication options */}
        {!loading && (
          <Box>
            {user ? (
              <>
                {/* Admin Dashboard button - always available when logged in */}
                {user && userUsername && (
                  <Button 
                    color="inherit" 
                    onClick={() => navigate(`/${userUsername}/admin`)}
                    sx={{ mr: 1 }}
                  >
                    Admin Dashboard
                  </Button>
                )}
                
                {/* User account menu */}
                <IconButton onClick={handleMenuOpen} color="inherit" sx={{ ml: 1 }}>
                  <Avatar 
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                  >
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login" sx={{ mr: 1 }}>
                  Login
                </Button>
                <Button color="inherit" component={Link} to="/signup" variant="outlined">
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
