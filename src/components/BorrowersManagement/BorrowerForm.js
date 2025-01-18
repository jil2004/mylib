import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  Chip,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { getAuth } from 'firebase/auth';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const BorrowerForm = ({ open, setOpen, fetchBorrowers, borrower, books = [] }) => {
  const [name, setName] = useState(borrower?.name || '');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowDate, setBorrowDate] = useState(borrower?.borrowDate ? new Date(borrower.borrowDate.toDate()) : new Date());
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [inputValue, setInputValue] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;

  // Initialize form with borrower data
  useEffect(() => {
    if (borrower) {
      setName(borrower.name || '');
      setBorrowDate(borrower.borrowDate ? new Date(borrower.borrowDate.toDate()) : new Date());
      setBorrowedBooks(borrower.borrowedBooks || []);
    } else {
      setName('');
      setBorrowDate(new Date());
      setBorrowedBooks([]);
    }
  }, [borrower]);

  const handleBookSelect = (event, value) => {
    if (value && !borrowedBooks.some(book => book.id === value.id)) {
      setBorrowedBooks([...borrowedBooks, value]);

      // Log the book being borrowed
      addDoc(collection(db, `Users/${user.uid}/logs`), {
        action: `Borrowed book "${value.title}" by ${name}`,
        timestamp: new Date(), // Use the current date and time
      });
    }
  };

  const handleBookRemove = (book) => {
    setBorrowedBooks(borrowedBooks.filter((b) => b.id !== book.id));

    // Log the book being returned
    addDoc(collection(db, `Users/${user.uid}/logs`), {
      action: `Returned book "${book.title}" by ${name}`,
      timestamp: new Date(), // Use the current date and time
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setSnackbarMessage('You must be logged in to add a borrower.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!name.trim()) {
      setSnackbarMessage('Please enter a borrower name.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const borrowerData = {
      name,
      borrowedBooks: borrowedBooks.map(book => book.id),
      borrowDate: serverTimestamp(),
    };

    setLoading(true);
    try {
      if (borrower) {
        // Update borrower
        await updateDoc(doc(db, `Users/${user.uid}/borrowers`, borrower.id), borrowerData);
        setSnackbarMessage('Borrower updated successfully!');

        // Log the update
        await addDoc(collection(db, `Users/${user.uid}/logs`), {
          action: `Updated borrower "${name}" with ${borrowedBooks.length} books`,
          timestamp: new Date(), // Use the current date and time
        });
      } else {
        // Add new borrower
        await addDoc(collection(db, `Users/${user.uid}/borrowers`), borrowerData);
        setSnackbarMessage('Borrower added successfully!');

        // Log the addition
        await addDoc(collection(db, `Users/${user.uid}/logs`), {
          action: `Added borrower "${name}" with ${borrowedBooks.length} books`,
          timestamp: new Date(), // Use the current date and time
        });
      }

      setSnackbarSeverity('success');
      fetchBorrowers();
      setOpen(false);
    } catch (error) {
      console.error('Error:', error);
      setSnackbarMessage('An error occurred. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const filteredBooks = books.filter(
    book => !borrowedBooks.some(borrowed => borrowed.id === book.id) &&
    book.title.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PersonAddIcon />
          {borrower ? 'Edit Borrower' : 'Add Borrower'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: <PersonAddIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <TextField
              label="Borrow Date"
              type="date"
              value={borrowDate.toISOString().split('T')[0]}
              onChange={(e) => setBorrowDate(new Date(e.target.value))}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />

            <Autocomplete
              options={filteredBooks}
              getOptionLabel={(book) => book.title || ''}
              onChange={handleBookSelect}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search Books" 
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <LibraryBooksIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Typography variant="body1">{option.title}</Typography>
                </Box>
              )}
            />

            {borrowedBooks.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected Books:
                </Typography>
                <Paper
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    listStyle: 'none',
                    p: 1,
                    m: 0,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                  }}
                  component="ul"
                >
                  {borrowedBooks.map((book) => (
                    <Chip
                      key={book.id}
                      label={book.title}
                      onDelete={() => handleBookRemove(book)}
                      sx={{ 
                        m: 0.5,
                        bgcolor: 'white',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                      }}
                    />
                  ))}
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button 
            onClick={() => setOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading || !name.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          elevation={6}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BorrowerForm;