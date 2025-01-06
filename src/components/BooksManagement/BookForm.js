import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress } from '@mui/material';
import { getAuth } from 'firebase/auth';
import { addLog } from '../../utils/firebaseUtils';

const BookForm = ({ open, setOpen, fetchBooks, book }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState([]);
  const [collectionName, setCollectionName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  // Reset form fields when the `book` prop changes
  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setCategory(book.category || []);
      setCollectionName(book.collection || '');
    } else {
      // Reset fields if no book is provided (i.e., adding a new book)
      setTitle('');
      setAuthor('');
      setCategory([]);
      setCollectionName('');
    }
  }, [book]);

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

    setLoading(true);
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
      console.error('Error:', error.message);
      setSnackbarMessage(error.message || 'An error occurred. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
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
              <MenuItem value="Non Fiction">Non Fiction</MenuItem>
              <MenuItem value="Mystery & Thriller">Mystery & Thriller</MenuItem>
              <MenuItem value="Adventure">Adventure</MenuItem>
              <MenuItem value="Biography">Biography</MenuItem>
              <MenuItem value="Self help & Personality Development">Self help & Personality Development</MenuItem>
              <MenuItem value="Health & Wellness">Health & Wellness</MenuItem>
              <MenuItem value="Politics & Social">Politics & Social</MenuItem>
              <MenuItem value="Philosophy & Religion">Philosophy & Religion</MenuItem>
              <MenuItem value="History">History</MenuItem>
              <MenuItem value="Travel & Geography">Travel & Geography</MenuItem>
              <MenuItem value="Science">Science</MenuItem>
              <MenuItem value="Business & Finance">Business & Finance</MenuItem>
              <MenuItem value="Reference & Dictionaries">Reference & Dictionaries</MenuItem>
              <MenuItem value="Children Book">Children Book</MenuItem>
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
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
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