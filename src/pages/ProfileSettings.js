import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Snackbar, Alert, Card, CardContent, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';

const ProfileSettings = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async () => {
    if (!user) {
      setSnackbarMessage('You must be logged in to update your profile.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!name) {
      setSnackbarMessage('Name cannot be empty.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Update profile in Firebase Authentication
      await updateProfile(user, { displayName: name });

      // Update name in Firestore Users collection
      const userDocRef = doc(db, 'Users', user.uid);
      await updateDoc(userDocRef, { name });

      setSnackbarMessage('Profile updated successfully!');
      setSnackbarSeverity('success');
      setIsEditingName(false); // Exit edit mode
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setSnackbarMessage(`Failed to update profile: ${error.message}`);
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbarMessage('All fields are required.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbarMessage('New password and confirm password do not match.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSnackbarMessage('Password updated successfully!');
      setSnackbarSeverity('success');
      setIsEditingPassword(false); // Exit edit mode
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error.message);
      setSnackbarMessage(`Failed to update password: current password incorrect`);
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    setLoading(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
      <Card sx={{ width: 400, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Profile Settings
          </Typography>

          {/* Email Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              Email: {user?.email}
            </Typography>
          </Box>

          {/* Name Section */}
          <Box sx={{ mb: 3 }}>
            {isEditingName ? (
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleUpdateProfile} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Save'}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Name: {user?.displayName}
                </Typography>
                <IconButton onClick={() => setIsEditingName(true)} sx={{ ml: 1 }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Password Section */}
          <Box sx={{ mb: 3 }}>
            {isEditingPassword ? (
              <>
                <TextField
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  onClick={handleUpdatePassword}
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                  Password: ********
                </Typography>
                <IconButton onClick={() => setIsEditingPassword(true)} sx={{ ml: 1 }}>
                  <LockResetIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileSettings;