import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc, addDoc, query, orderBy } from 'firebase/firestore';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { getAuth } from 'firebase/auth';
import BorrowerForm from './BorrowerForm';
import BorrowerList from './BorrowerList';

const BorrowersManagement = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch books
      const booksSnapshot = await getDocs(collection(db, `Users/${user.uid}/books`));
      const booksData = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksData);

      // Fetch borrowers
      const borrowersSnapshot = await getDocs(collection(db, `Users/${user.uid}/borrowers`));
      const borrowersData = borrowersSnapshot.docs.map((doc) => {
        const borrower = doc.data();
        const borrowedBooks = borrower.borrowedBooks?.map((bookId) => {
          const book = booksData.find((b) => b.id === bookId);
          return book ? { id: bookId, title: book.title } : null;
        }).filter((book) => book);

        return {
          id: doc.id,
          ...borrower,
          borrowedBooks: borrowedBooks || [],
        };
      });

      setBorrowers(borrowersData);
      setFilteredBorrowers(borrowersData);

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = borrowers.filter((borrower) =>
      borrower.name.toLowerCase().includes(term)
    );
    setFilteredBorrowers(filtered);
  };

  const handleEdit = (borrower) => {
    setSelectedBorrower(borrower);
    setOpen(true);
  };

  const handleDeleteBorrower = async (borrowerId, borrowerName, borrowedBooks) => {
    try {
      if (!user) return;

      // Delete the borrower
      await deleteDoc(doc(db, `Users/${user.uid}/borrowers`, borrowerId));

      // Add a log entry with the borrower's name and borrowed books
      await addDoc(collection(db, `Users/${user.uid}/logs`), {
        action: `Deleted borrower "${borrowerName}" with ID ${borrowerId}. Borrowed books: ${borrowedBooks.map(book => `${book.title} (ID: ${book.id})`).join(', ')}`,
        timestamp: new Date(), // Use the current date and time
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error deleting borrower:', error);
    }
  };

  if (!user) {
    return <Alert severity="error">Please log in to manage borrowers.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.light' }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'white' }}>
          Borrowers Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'white', opacity: 0.9 }}>
          Manage your book borrowers and their borrowed books
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: 500 }}>
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search borrowers..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedBorrower(null);
            setOpen(true);
          }}
        >
          Add Borrower
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredBorrowers.length === 0 ? (
        <Alert severity="info">
          {searchTerm ? 'No borrowers found matching your search.' : 'No borrowers added yet.'}
        </Alert>
      ) : (
        <BorrowerList
          borrowers={filteredBorrowers}
          onEdit={handleEdit}
          onDeleteBorrower={handleDeleteBorrower}
        />
      )}

      <BorrowerForm
        open={open}
        setOpen={setOpen}
        fetchBorrowers={fetchData}
        borrower={selectedBorrower}
        books={books}
      />
    </Box>
  );
};

export default BorrowersManagement;