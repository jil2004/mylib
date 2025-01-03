import React, { useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert } from '@mui/material';
import { getAuth } from 'firebase/auth';

const BookForm = ({ open, setOpen, fetchBooks, book }) => {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [category, setCategory] = useState(book?.category || []);
  const [collectionName, setCollectionName] = useState(book?.collection || '');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setSnackbarMessage('You must be logged in to add a book.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const bookData = {
      title,
      author,
      category,
      collection: collectionName,
      addDate: serverTimestamp(),
    };

    try {
      if (book) {
        // Update existing book
        await updateDoc(doc(db, 'Users', user.uid, 'books', book.id), bookData);
        setSnackbarMessage('Book updated successfully!');
        await addLog('UPDATE_BOOK', book.id, null, `Updated book "${title}" by ${author}`);
      } else {
        // Add new book
        const userBooksRef = collection(db, 'Users', user.uid, 'books');
        const newBookRef = await addDoc(userBooksRef, bookData);
        setSnackbarMessage('Book added successfully!');
        await addLog('ADD_BOOK', newBookRef.id, null, `Added book "${title}" by ${author}`);
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

  const addLog = async (type, bookID, borrowerID, details) => {
    if (!user) {
      console.error('User not logged in.');
      return;
    }

    const logData = {
      type,
      bookID,
      borrowerID,
      timestamp: serverTimestamp(),
      details,
    };

    try {
      const logsRef = collection(db, 'Logs');
      await addDoc(logsRef, logData);
      console.log('Log added successfully!');
    } catch (error) {
      console.error('Error adding log:', error.message);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{book ? 'Edit Book' : 'Add Book'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            label="Collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            fullWidth
            margin="normal"
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