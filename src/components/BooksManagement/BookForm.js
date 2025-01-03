import React, { useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';

const BookForm = ({ open, setOpen, fetchBooks, book }) => {
  const [name, setName] = useState(book?.name || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [category, setCategory] = useState(book?.category || []);
  const [addDate, setAddDate] = useState(book?.addDate || new Date());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if a book with the same name already exists
    const booksSnapshot = await getDocs(collection(db, 'Books'));
    const existingBook = booksSnapshot.docs.find(doc => doc.data().name === name);

    if (existingBook && !book) {
      setSnackbarMessage('A book with the same name already exists!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const bookData = { name, author, category, addDate };
    try {
      if (book) {
        await updateDoc(doc(db, 'Books', book.id), bookData);
        setSnackbarMessage('Book updated successfully!');
      } else {
        await addDoc(collection(db, 'Books'), bookData);
        setSnackbarMessage('Book added successfully!');
      }
      setSnackbarSeverity('success');
      fetchBooks();
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
        <DialogTitle>{book ? 'Edit Book' : 'Add Book'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              multiple
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="Fiction">Fiction</MenuItem>
              <MenuItem value="Non-Fiction">Non-Fiction</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="History">History</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Add Date"
            type="date"
            value={addDate.toISOString().split('T')[0]}
            onChange={(e) => setAddDate(new Date(e.target.value))}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
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

export default BookForm;