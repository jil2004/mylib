import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Snackbar, Alert, Card, CardContent, IconButton, InputAdornment, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteIcon from '@mui/icons-material/Delete';
import * as XLSX from 'xlsx'; // For Excel export

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      if (!user) {
        setSnackbarMessage('You must be logged in to delete your account.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Reauthenticate the user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Delete all user data from Firestore
      const userCollections = ['books', 'borrowers', 'logs']; // Add other collections if needed
      for (const collectionName of userCollections) {
        const collectionRef = collection(db, 'Users', user.uid, collectionName);
        const collectionSnapshot = await getDocs(collectionRef);
        for (const docRef of collectionSnapshot.docs) {
          await deleteDoc(doc(db, 'Users', user.uid, collectionName, docRef.id));
        }
      }

      // Delete the user account from Firebase Authentication
      await deleteUser(user);

      setSnackbarMessage('Account and all data deleted successfully!');
      setSnackbarSeverity('success');
      setDeleteDialogOpen(false);
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error deleting account:', error.message);
      setSnackbarMessage(`Failed to delete account: ${error.message}`);
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    setLoading(false);
  };

  const handleExportToExcel = async () => {
    setLoading(true);
    try {
      if (!user) {
        setSnackbarMessage('You must be logged in to export data.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
  
      // Fetch books data
      const booksRef = collection(db, 'Users', user.uid, 'books');
      const booksSnapshot = await getDocs(booksRef);
      const booksData = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title || 'N/A',
        author: doc.data().author || 'N/A',
        category: doc.data().category?.join(', ') || 'No categories',
        addedDate: doc.data().addDate?.toDate().toLocaleDateString('en-GB') || 'N/A', // Traditional date format
      }));
  
      // Create a map of book IDs to titles for quick lookup
      const bookIdToTitleMap = booksData.reduce((map, book) => {
        map[book.id] = book.title;
        return map;
      }, {});
  
      // Debugging: Log the bookIdToTitleMap
      console.log('Book ID to Title Map:', bookIdToTitleMap);
  
      // Fetch borrowers data
      const borrowersRef = collection(db, 'Users', user.uid, 'borrowers');
      const borrowersSnapshot = await getDocs(borrowersRef);
      const borrowersData = borrowersSnapshot.docs.map(doc => {
        const borrowerData = doc.data();
  
        // Get borrower's name
        const name = borrowerData.name || 'N/A';
  
        // Debugging: Log the borrower's borrowedBooks
        console.log(`Borrower ${name} - Borrowed Books:`, borrowerData.borrowedBooks);
  
        // Get borrowed book titles using the borrowedBooks array
        const borrowedBooks = borrowerData.borrowedBooks && borrowerData.borrowedBooks.length > 0
          ? borrowerData.borrowedBooks
              .map(bookId => {
                const title = bookIdToTitleMap[bookId];
                console.log(`Book ID: ${bookId} - Title: ${title}`); // Debugging
                return title || 'N/A';
              })
              .join(', ') // Join titles into a single string
          : 'No books borrowed';
  
        // Get borrow date (if available)
        const borrowDate = borrowerData.borrowDate
          ? borrowerData.borrowDate.toDate().toLocaleDateString('en-GB')
          : 'N/A';
  
        return {
          id: doc.id,
          name,
          borrowedBooks,
          borrowDate,
        };
      });
  
      // Debugging: Log the borrowers data
      console.log('Borrowers Data:', borrowersData);
  
      // Create a workbook with two sheets
      const workbook = XLSX.utils.book_new();
      const booksWorksheet = XLSX.utils.json_to_sheet(booksData);
      const borrowersWorksheet = XLSX.utils.json_to_sheet(borrowersData);
  
      XLSX.utils.book_append_sheet(workbook, booksWorksheet, 'Books');
      XLSX.utils.book_append_sheet(workbook, borrowersWorksheet, 'Borrowers');
  
      // Save the workbook as an Excel file
      XLSX.writeFile(workbook, 'BooksAndBorrowers.xlsx');
  
      setSnackbarMessage('Data exported to Excel successfully!');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error exporting data:', error.message);
      setSnackbarMessage(`Failed to export data: ${error.message}`);
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

          {/* Export to Excel Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleExportToExcel}
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Export Books & Borrowers to Excel'}
            </Button>
          </Box>

          {/* Delete Account Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              fullWidth
              disabled={loading}
              startIcon={<DeleteIcon />}
            >
              Delete Account
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account and all associated data? This action cannot be undone.
          </Typography>
          <TextField
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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