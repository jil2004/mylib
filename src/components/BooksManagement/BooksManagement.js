import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Button, Typography, Box, TextField, List, ListItem, ListItemText, Divider, IconButton, Card, CircularProgress } from '@mui/material';
import BookForm from './BookForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAuth } from 'firebase/auth';

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch books from Firestore
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error('User not logged in.');
        return;
      }

      // Query the nested collection: Users/{userId}/books
      const booksRef = collection(db, 'Users', user.uid, 'books');
      console.log('Fetching books from:', booksRef.path); // Debugging log
      const booksSnapshot = await getDocs(booksRef);
      console.log('Books Snapshot:', booksSnapshot); // Debugging log

      if (booksSnapshot.empty) {
        console.log('No books found in the collection.'); // Debugging log
      } else {
        const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched Books:', booksData); // Debugging log
        setBooks(booksData);
        setFilteredBooks(booksData);
      }
    } catch (error) {
      console.error('Error fetching books:', error.message); // Debugging log
    } finally {
      setLoading(false);
    }
  };

  // Fetch books when the component mounts
  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = books.filter(book =>
      book.title.toLowerCase().includes(term) || // Use `title` instead of `name`
      book.author.toLowerCase().includes(term)
    );
    setFilteredBooks(filtered);
  };

  // Handle book deletion
  const handleDelete = async (id) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error('User not logged in.');
        return;
      }

      // Delete from the nested collection: Users/{userId}/books/{bookId}
      await deleteDoc(doc(db, 'Users', user.uid, 'books', id));
      fetchBooks(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting book:', error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Books Management</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Search Books"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: '300px' }}
        />
        <Button variant="contained" onClick={() => { setSelectedBook(null); setOpen(true); }}>Add Book</Button>
      </Box>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        {loading ? (
          <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
        ) : (
          <List>
            {filteredBooks.map((book, index) => (
              <React.Fragment key={book.id}>
                <ListItem>
                  <ListItemText
                    primary={book.title} // Use `title` instead of `name`
                    secondary={`Author: ${book.author} | Categories: ${book.category?.join(', ') || 'No categories'} | Added: ${book.addDate ? book.addDate.toDate().toLocaleDateString() : 'Unknown'}`}
                  />
                  <IconButton onClick={() => { setSelectedBook(book); setOpen(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(book.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
                {index < filteredBooks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>
      <BookForm open={open} setOpen={setOpen} fetchBooks={fetchBooks} book={selectedBook} />
    </Box>
  );
};

export default BooksManagement;