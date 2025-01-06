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
  Snackbar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  OutlinedInput,
  useTheme,
} from '@mui/material';
import { getAuth } from 'firebase/auth';
import { addLog } from '../../utils/firebaseUtils';

// Categories list
const categories = [
  'Fiction',
  'Non Fiction',
  'Mystery & Thriller',
  'Adventure',
  'Biography',
  'Self help & Personality Development',
  'Health & Wellness',
  'Politics & Social',
  'Philosophy & Religion',
  'History',
  'Travel & Geography',
  'Science',
  'Business & Finance',
  'Reference & Dictionaries',
  'Children Book',
];

// Menu props for the Select component
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BookForm = ({ open, setOpen, fetchBooks, book }) => {
  const theme = useTheme();
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
      setCategory(book.category || []); // Ensure category is initialized as an array
      setCollectionName(book.collection || '');
    } else {
      // Reset fields if no book is provided (i.e., adding a new book)
      setTitle('');
      setAuthor('');
      setCategory([]);
      setCollectionName('');
    }
  }, [book]);

  // Handle category selection
  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setCategory(typeof value === 'string' ? value.split(',') : value);
  };

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
            <InputLabel id="categories-label">Categories</InputLabel>
            <Select
              labelId="categories-label"
              id="categories"
              multiple
              value={category}
              onChange={handleCategoryChange}
              input={<OutlinedInput id="select-categories" label="Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {categories.map((cat) => (
                <MenuItem
                  key={cat}
                  value={cat}
                  style={{
                    fontWeight: category.includes(cat)
                      ? theme.typography.fontWeightMedium
                      : theme.typography.fontWeightRegular,
                  }}
                >
                  {cat}
                </MenuItem>
              ))}
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