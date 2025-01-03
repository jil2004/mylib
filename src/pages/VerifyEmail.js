import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { getAuth, sendEmailVerification } from 'firebase/auth';

const VerifyEmail = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  const handleResendVerificationEmail = async () => {
    try {
      await sendEmailVerification(user);
      alert('Verification email sent. Please check your inbox.');
    } catch (error) {
      alert(`Failed to send verification email: ${error.message}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Verify Your Email
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          A verification email has been sent to {user?.email}. Please verify your email to access the dashboard.
        </Typography>
        <Button variant="contained" onClick={handleResendVerificationEmail}>
          Resend Verification Email
        </Button>
      </Box>
    </Box>
  );
};

export default VerifyEmail;