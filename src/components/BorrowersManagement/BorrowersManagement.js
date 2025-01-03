// src/components/BorrowersManagement.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button, Typography, Box, TextField, List, ListItem, ListItemText, Divider, IconButton, Autocomplete, Chip, Card, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BorrowerForm from './BorrowerForm';

const BorrowersManagement = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBorrowers();
    fetchBooks();
  }, []);

  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const borrowersSnapshot = await getDocs(collection(db, 'Borrowers'));
      const booksSnapshot = await getDocs(collection(db, 'Books'));
      const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const borrowersData = borrowersSnapshot.docs.map(doc => {
        const borrower = doc.data();
        const borrowedBooks = borrower.borrowedBooks?.map(bookId => {
          const book = booksData.find(b => b.id === bookId);
          return book ? { id: bookId, name: book.name, borrowDate: borrower.borrowDate } : { id: bookId, name: 'Unknown Book', borrowDate: borrower.borrowDate };
        });
        return { id: doc.id, ...borrower, borrowedBooks };
      });

      const filtered = borrowersData.filter(borrower => borrower.borrowedBooks?.length > 0);
      setBorrowers(filtered);
      setFilteredBorrowers(filtered);
    } catch (error) {
      console.error('Error fetching borrowers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const booksSnapshot = await getDocs(collection(db, 'Books'));
      setBooks(booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching books:', error.message);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = borrowers.filter(borrower =>
      borrower.name.toLowerCase().includes(term)
    );
    setFilteredBorrowers(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Borrowers', id));
      fetchBorrowers();
    } catch (error) {
      console.error('Error deleting borrower:', error.message);
    }
  };

  const handleRemoveBook = async (borrowerId, bookId) => {
    try {
      const borrower = borrowers.find(b => b.id === borrowerId);
      const updatedBooks = borrower.borrowedBooks.filter(book => book.id !== bookId);
      await updateDoc(doc(db, 'Borrowers', borrowerId), { borrowedBooks: updatedBooks.map(book => book.id) });
      fetchBorrowers();
    } catch (error) {
      console.error('Error removing book:', error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Borrowers Management</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Search Borrowers"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: '300px' }}
        />
        <Button variant="contained" onClick={() => { setSelectedBorrower(null); setOpen(true); }}>Add Borrower</Button>
      </Box>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        {loading ? (
          <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
        ) : (
          <List>
            {filteredBorrowers.map((borrower, index) => (
              <React.Fragment key={borrower.id}>
                <ListItem>
                  <ListItemText
                    primary={borrower.name}
                    secondary={
                      borrower.borrowedBooks?.map(book => (
                        <Box key={book.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{book.name}</Typography>
                          <Typography variant="body2" color="text.secondary">(Borrowed on: {book.borrowDate?.toDate().toLocaleDateString()})</Typography>
                          <IconButton onClick={() => handleRemoveBook(borrower.id, book.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))
                    }
                  />
                  <IconButton onClick={() => { setSelectedBorrower(borrower); setOpen(true); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(borrower.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
                {index < filteredBorrowers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Card>
      <BorrowerForm open={open} setOpen={setOpen} fetchBorrowers={fetchBorrowers} borrower={selectedBorrower} books={books} />
    </Box>
  );
};

export default BorrowersManagement;