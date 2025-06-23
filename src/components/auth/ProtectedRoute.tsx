import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../config/firebase';
import { getUserProfileByUsername } from '../../services/authService';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const { username } = useParams<{ username: string }>();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const { setCalendarOwnerUsername } = useAppContext();

  // Set the calendar owner username in context
  useEffect(() => {
    if (username) {
      setCalendarOwnerUsername(username);
    }
  }, [username, setCalendarOwnerUsername]);

  // Check if the current user is the owner of this calendar
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user || !username) {
        setIsOwner(false);
        setCheckingOwnership(false);
        return;
      }

      try {
        const userProfile = await getUserProfileByUsername(username);
        if (userProfile && userProfile.uid === user.uid) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error checking ownership:', error);
        setIsOwner(false);
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [user, username]);

  // Show loading while authentication is in progress
  if (loading || checkingOwnership) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated or not the owner
  if (!user || !isOwner) {
    return <Navigate to="/login" />;
  }

  // Render children if the user is authenticated and is the owner
  return <>{children}</>;
};

export default ProtectedRoute;
