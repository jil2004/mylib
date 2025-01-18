import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Snackbar, Alert, Link } from '@mui/material';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !name) {
      setError('Please fill in all fields.');
      setSnackbarOpen(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSnackbarOpen(true);
      return;
    }

    const auth = getAuth();
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Set displayName in Firebase Authentication
      await updateProfile(user, { displayName: name });

      // Step 3: Send verification email
      await sendEmailVerification(user);

      // Step 4: Create user document in Firestore
      const userDocRef = doc(db, 'Users', user.uid);
      await setDoc(userDocRef, {
        name: name,
        email: user.email,
      });

      // Show success message and redirect to verify-email page
      setError('Signup successful! Please verify your email to log in.');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/verify-email');
      }, 3000);
    } catch (error) {
      setError(error.message);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ width: 300 }}>
        <Typography variant="h4" gutterBottom>Sign Up</Typography>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={handleSignup}
          fullWidth
          sx={{ mt: 2 }}
        >
          Sign Up
        </Button>
        <Typography sx={{ mt: 2 }}>
          Already have an account? <Link href="/login">Login</Link>
        </Typography>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={error.includes('success') ? 'success' : 'error'}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Signup;