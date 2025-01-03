import React, { useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Autocomplete, Snackbar, Alert } from '@mui/material';

const BorrowerForm = ({ open, setOpen, fetchBorrowers, borrower, books }) => {
  const [name, setName] = useState(borrower?.name || '');
  const [borrowedBooks, setBorrowedBooks] = useState(borrower?.borrowedBooks || []);
  const [borrowDate, setBorrowDate] = useState(borrower?.borrowDate || new Date());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if borrower with the same name already exists
    const borrowersSnapshot = await getDocs(collection(db, 'Borrowers'));
    const existingBorrower = borrowersSnapshot.docs.find(doc => doc.data().name === name);

    if (existingBorrower && !borrower) {
      setSnackbarMessage('Borrower with the same name already exists!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const borrowerData = { name, borrowedBooks: borrowedBooks.map(book => book.id), borrowDate };
    try {
      if (borrower) {
        await updateDoc(doc(db, 'Borrowers', borrower.id), borrowerData);
        setSnackbarMessage('Borrower updated successfully!');
      } else {
        await addDoc(collection(db, 'Borrowers'), borrowerData);
        setSnackbarMessage('Borrower added successfully!');
      }
      setSnackbarSeverity('success');
      fetchBorrowers();
      setOpen(false);
    } catch (error) {
      setSnackbarMessage('An error occurred. Please try again.');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{borrower ? 'Edit Borrower' : 'Add Borrower'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Borrow Date"
            type="date"
            value={borrowDate.toISOString().split('T')[0]}
            onChange={(e) => setBorrowDate(new Date(e.target.value))}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <Autocomplete
            multiple
            options={books.filter(book => !book.borrowerId)}
            getOptionLabel={(book) => book.name}
            value={books.filter(book => borrowedBooks.includes(book.id))}
            onChange={(e, value) => setBorrowedBooks(value)}
            renderInput={(params) => <TextField {...params} label="Borrowed Books" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BorrowerForm;