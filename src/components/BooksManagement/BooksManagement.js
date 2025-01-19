import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Card,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import BookForm from './BookForm';

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

// Styled components for mobile responsiveness
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxWidth: '100%',
  overflowX: 'auto',
  [theme.breakpoints.down('sm')]: {
    marginLeft: '-16px', // Adjust for padding
    marginRight: '-16px', // Adjust for padding
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    padding: '8px',
    fontSize: '0.875rem',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    padding: '4px 8px',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const BooksManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State declarations
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [view, setView] = useState('list'); // Default to list view
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const auth = getAuth();
  const user = auth.currentUser;

  // Core functions
  const fetchBooks = async () => {
    setLoading(true);
    try {
      if (!user) {
        showSnackbar('User not logged in', 'error');
        return;
      }

      const booksRef = collection(db, 'Users', user.uid, 'books');
      const booksSnapshot = await getDocs(booksRef);
      const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
      setFilteredBooks(booksData);
      showSnackbar('Books loaded successfully', 'success');
    } catch (error) {
      showSnackbar('Error fetching books: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [user]);

  useEffect(() => {
    applyFilters(searchTerm);
  }, [selectedAuthors, selectedCategories, selectedCollections, sortField, sortOrder]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const applyFilters = (searchTerm = '') => {
    let filtered = books.filter(book =>
      (book.title.toLowerCase().includes(searchTerm) || 
       book.author.toLowerCase().includes(searchTerm)) &&
      (selectedAuthors.length === 0 || selectedAuthors.includes(book.author)) &&
      (selectedCategories.length === 0 || selectedCategories.some(cat => book.category.includes(cat))) &&
      (selectedCollections.length === 0 || selectedCollections.includes(book.collection))
    );

    filtered.sort((a, b) => {
      const compareValue = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'title') {
        return a.title.localeCompare(b.title) * compareValue;
      } else if (sortField === 'addDate') {
        return (a.addDate.toDate() - b.addDate.toDate()) * compareValue;
      }
      return 0;
    });

    setFilteredBooks(filtered);
  };

  const handleSelectBook = (id) => {
    setSelectedBooks(prev => 
      prev.includes(id) ? prev.filter(bookId => bookId !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    try {
      for (const id of selectedBooks) {
        await deleteDoc(doc(db, 'Users', user.uid, 'books', id));
        await addDoc(collection(db, 'Users', user.uid, 'logs'), {
          action: `Deleted book with ID ${id}`,
          timestamp: new Date(),
        });
      }
      setFilteredBooks(prev => prev.filter(book => !selectedBooks.includes(book.id)));
      setSelectedBooks([]);
      showSnackbar(`Successfully deleted ${selectedBooks.length} book(s)`);
    } catch (error) {
      showSnackbar('Error deleting books: ' + error.message, 'error');
    }
    setDeleteDialogOpen(false);
  };

  const GridView = () => (
    <Grid container spacing={2}>
      {filteredBooks.map((book) => (
        <Grid item xs={12} sm={6} md={4} key={book.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <Box sx={{ p: 2, flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                  {book.title}
                </Typography>
                <Checkbox
                  checked={selectedBooks.includes(book.id)}
                  onChange={() => handleSelectBook(book.id)}
                />
              </Box>
              <Typography color="textSecondary" gutterBottom>
                {book.author}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {book.category.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    sx={{ margin: '2px' }}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="textSecondary">
                  Added: {book.addDate.toDate().toLocaleDateString()}
                </Typography>
                <IconButton 
                  onClick={() => { setSelectedBook(book); setOpen(true); }}
                  size="small"
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const ListView = () => (
    <StyledTableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedBooks.length > 0 && selectedBooks.length === filteredBooks.length}
                indeterminate={selectedBooks.length > 0 && selectedBooks.length < filteredBooks.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedBooks(filteredBooks.map(book => book.id));
                  } else {
                    setSelectedBooks([]);
                  }
                }}
              />
            </TableCell>
            <StyledTableCell>
              <TableSortLabel
                active={sortField === 'title'}
                direction={sortOrder}
                onClick={() => handleSort('title')}
              >
                Title
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell>Author</StyledTableCell>
            <StyledTableCell>Categories</StyledTableCell>
            <StyledTableCell>
              <TableSortLabel
                active={sortField === 'addDate'}
                direction={sortOrder}
                onClick={() => handleSort('addDate')}
              >
                Added Date
              </TableSortLabel>
            </StyledTableCell>
            <StyledTableCell align="right">Actions</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBooks.map((book) => (
            <TableRow key={book.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedBooks.includes(book.id)}
                  onChange={() => handleSelectBook(book.id)}
                />
              </TableCell>
              <StyledTableCell>{book.title}</StyledTableCell>
              <StyledTableCell>{book.author}</StyledTableCell>
              <StyledTableCell>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {book.category.map((cat) => (
                    <Chip key={cat} label={cat} size="small" />
                  ))}
                </Box>
              </StyledTableCell>
              <StyledTableCell>{book.addDate.toDate().toLocaleDateString()}</StyledTableCell>
              <StyledTableCell align="right">
                <IconButton onClick={() => { setSelectedBook(book); setOpen(true); }}>
                  <EditIcon />
                </IconButton>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );

  return (
    <Box sx={{ p: isMobile ? 1 : 3, maxWidth: '100%', overflowX: 'hidden' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Books Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <StyledTextField
            placeholder="Search books..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchBooks}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Toggle View">
              <IconButton onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
                {view === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
              </IconButton>
            </Tooltip>
            <StyledButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { setSelectedBook(null); setOpen(true); }}
            >
              Add Book
            </StyledButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <StyledButton
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </StyledButton>
        {selectedBooks.length > 0 && (
          <StyledButton
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Selected ({selectedBooks.length})
          </StyledButton>
        )}
      </Box>

      {showFilters && (
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <StyledFormControl>
            <InputLabel>Author</InputLabel>
            <Select
              multiple
              value={selectedAuthors}
              onChange={(e) => setSelectedAuthors(e.target.value)}
              input={<OutlinedInput label="Author" />}
              renderValue={(selected) => selected.join(', ')}
              size="small"
            >
              {[...new Set(books.map(book => book.author))].map((author) => (
                <MenuItem key={author} value={author}>
                  <Checkbox checked={selectedAuthors.includes(author)} />
                  {author}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
          <StyledFormControl>
            <InputLabel>Category</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={(e) => setSelectedCategories(e.target.value)}
              input={<OutlinedInput label="Category" />}
              renderValue={(selected) => selected.join(', ')}
              size="small"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  <Checkbox checked={selectedCategories.includes(category)} />
                  {category}
                </MenuItem>
              ))}
            </Select>
          </StyledFormControl>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        filteredBooks.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No books found. Try adjusting your search or filters.
            </Typography>
          </Paper>
        ) : (
          view === 'grid' ? <GridView /> : <ListView />
        )
      )}

      <BookForm 
        open={open} 
        setOpen={setOpen}
        book={selectedBook}
        fetchBooks={fetchBooks}  // Updated prop name
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullScreen={isMobile} // Make the dialog fullscreen on mobile
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedBooks.length} selected book(s)?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BooksManagement;