import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Box, Alert } from '@mui/material';
import { registerUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate username format (only alphanumeric and underscore)
    if (!username.match(/^[a-zA-Z0-9_]+$/)) {
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    try {
      await registerUser(email, password, username, displayName);
      navigate(`/${username}/admin`); // Redirect to the admin dashboard
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="80vh"
    >
      <Paper elevation={3} style={{ padding: '2rem', maxWidth: '500px', width: '100%' }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Create Your Calendar Account
        </Typography>
        
        {error && <Alert severity="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="Password must be at least 6 characters"
          />
          
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            required
            helperText="This will be your calendar URL (e.g., domain.com/username)"
          />
          
          <TextField
            label="Display Name"
            fullWidth
            margin="normal"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Button color="primary" onClick={() => navigate('/login')}>
                Log In
              </Button>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SignUp;
