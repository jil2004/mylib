import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
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
  Paper,
  styled,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { getAuth } from 'firebase/auth';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import DeleteIcon from '@mui/icons-material/Delete';

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

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const CategoryChip = styled(Paper)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  listStyle: 'none',
  padding: theme.spacing(1),
  margin: theme.spacing(1, 0),
  backgroundColor: theme.palette.grey[50],
}));

const BookForm = ({ open, setOpen, fetchBooks, book }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (book) {
      setTitle(book.title || '');
      setAuthor(book.author || '');
      setSelectedCategories(
        book.category?.map((cat, index) => ({
          key: index,
          label: cat,
        })) || []
      );
    } else {
      resetForm();
    }
  }, [book]);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setSelectedCategories([]);
    setErrors({});
  };

  const handleAddCategory = (category) => {
    if (!selectedCategories.some(cat => cat.label === category)) {
      setSelectedCategories([
        ...selectedCategories,
        { key: selectedCategories.length, label: category }
      ]);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    setSelectedCategories(
      selectedCategories.filter((category) => category.key !== categoryToDelete.key)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!author.trim()) newErrors.author = 'Author is required';
    if (selectedCategories.length === 0) newErrors.categories = 'At least one category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateBook = async () => {
    const userBooksRef = collection(db, 'Users', user.uid, 'books');
    const q = query(
      userBooksRef,
      where('title', '==', title.trim()),
      where('author', '==', author.trim())
    );
    
    const querySnapshot = await getDocs(q);
    const isDuplicate = !querySnapshot.empty && 
      (!book || (book && querySnapshot.docs[0].id !== book.id));
    
    return isDuplicate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setSnackbarMessage('You must be logged in to add a book.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const isDuplicate = await checkDuplicateBook();
      if (isDuplicate) {
        setSnackbarMessage('This book already exists in your library!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false);
        return;
      }

      const bookData = {
        title: title.trim(),
        author: author.trim(),
        category: selectedCategories.map(cat => cat.label),
        addDate: serverTimestamp(),
        lastModified: serverTimestamp(),
      };

      if (book) {
        await updateDoc(doc(db, 'Users', user.uid, 'books', book.id), bookData);
        setSnackbarMessage('Book updated successfully!');
        await addDoc(collection(db, 'Users', user.uid, 'logs'), {
          action: `Updated book "${title}" by ${author}`,
          timestamp: new Date(),
        });
      } else {
        const userBooksRef = collection(db, 'Users', user.uid, 'books');
        const newBookRef = await addDoc(userBooksRef, bookData);
        setSnackbarMessage('Book added successfully!');
        await addDoc(collection(db, 'Users', user.uid, 'logs'), {
          action: `Added book "${title}" by ${author}`,
          timestamp: new Date(),
        });
      }
      
      setSnackbarSeverity('success');
      fetchBooks();  // Ensure this is called correctly
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error:', error.message);
      setSnackbarMessage(error.message || 'An error occurred. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalLibraryIcon />
          <Typography variant="h6">
            {book ? 'Edit Book' : 'Add New Book'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.title}
              helperText={errors.title}
              required
            />
            <TextField
              label="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.author}
              helperText={errors.author}
              required
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Categories
            </Typography>
            <CategoryChip component="ul" elevation={0}>
              {selectedCategories.map((data) => (
                <ListItem key={data.key}>
                  <Chip
                    icon={<LocalLibraryIcon />}
                    label={data.label}
                    onDelete={() => handleDeleteCategory(data)}
                    deleteIcon={<DeleteIcon />}
                    color="primary"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </CategoryChip>
            
            <Paper sx={{ p: 2, mt: 2 }} elevation={0} variant="outlined">
              <Typography variant="subtitle2" gutterBottom>
                Available Categories:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categories
                  .filter(cat => !selectedCategories.some(selected => selected.label === cat))
                  .map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => handleAddCategory(category)}
                      color="default"
                      size="small"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
              </Box>
            </Paper>
            
            {errors.categories && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                {errors.categories}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Book'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BookForm;