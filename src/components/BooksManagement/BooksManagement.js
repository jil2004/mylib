import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Button, Typography, Box, TextField, List, ListItem, ListItemText, Divider, IconButton, Card } from '@mui/material';
import BookForm from './BookForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const booksSnapshot = await getDocs(collection(db, 'Books'));
    const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBooks(booksData);
    setFilteredBooks(booksData);
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = books.filter(book =>
      book.name.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
    setFilteredBooks(filtered);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'Books', id));
    fetchBooks();
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
        <List>
          {filteredBooks.map((book, index) => (
            <React.Fragment key={book.id}>
              <ListItem>
                <ListItemText
                  primary={book.name}
                  secondary={`Author: ${book.author} | Categories: ${book.category?.join(', ') || 'No categories'} | Added: ${book.addDate?.toDate().toLocaleDateString()}`}
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
      </Card>
      <BookForm open={open} setOpen={setOpen} fetchBooks={fetchBooks} book={selectedBook} />
    </Box>
  );
};

export default BooksManagement;