import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import {
  Button,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
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
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { TableVirtuoso } from 'react-virtuoso';
import BookForm from './BookForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

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

const BooksManagement = () => {
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
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [view, setView] = useState('list');
  const [selectedBooks, setSelectedBooks] = useState([]);

  // Fetch books from Firestore
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const booksSnapshot = await getDocs(collection(db, 'Books'));
      const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
      setFilteredBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle filters
  const applyFilters = (searchTerm = '') => {
    let filtered = books.filter(book =>
      book.title.toLowerCase().includes(searchTerm) &&
      (selectedAuthors.length === 0 || selectedAuthors.includes(book.author)) &&
      (selectedCategories.length === 0 || selectedCategories.some(cat => book.category.includes(cat))) &&
      (selectedCollections.length === 0 || selectedCollections.includes(book.collection)) &&
      (!dateRange.start || new Date(book.addDate.toDate()) >= dateRange.start) &&
      (!dateRange.end || new Date(book.addDate.toDate()) <= dateRange.end)
    );

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortField === 'title') {
        return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else if (sortField === 'author') {
        return sortOrder === 'asc' ? a.author.localeCompare(b.author) : b.author.localeCompare(a.author);
      } else if (sortField === 'addDate') {
        return sortOrder === 'asc' ? a.addDate.toDate() - b.addDate.toDate() : b.addDate.toDate() - a.addDate.toDate();
      }
      return 0;
    });

    setFilteredBooks(filtered);
  };

  // Handle book selection
  const handleSelectBook = (id) => {
    if (selectedBooks.includes(id)) {
      setSelectedBooks(selectedBooks.filter(bookId => bookId !== id));
    } else {
      setSelectedBooks([...selectedBooks, id]);
    }
  };

  // Handle delete selected books
  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedBooks) {
        await deleteDoc(doc(db, 'Books', id));
      }
      fetchBooks();
      setSelectedBooks([]);
    } catch (error) {
      console.error('Error deleting books:', error.message);
    }
  };

  // Handle delete individual book
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'Books', id));
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error.message);
    }
  };

  // Virtualized table components
  const VirtuosoTableComponents = {
    Scroller: React.forwardRef((props, ref) => (
      <TableContainer component={Paper} {...props} ref={ref} />
    )),
    Table: (props) => (
      <Table {...props} sx={{ borderCollapse: 'separate', tableLayout: 'fixed' }} />
    ),
    TableHead: React.forwardRef((props, ref) => <TableHead {...props} ref={ref} />),
    TableRow,
    TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
  };

  const fixedHeaderContent = () => (
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={selectedBooks.length > 0 && selectedBooks.length < filteredBooks.length}
          checked={selectedBooks.length === filteredBooks.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedBooks(filteredBooks.map(book => book.id));
            } else {
              setSelectedBooks([]);
            }
          }}
        />
      </TableCell>
      <TableCell>Title</TableCell>
      <TableCell>Author</TableCell>
      <TableCell>Categories</TableCell>
      <TableCell>Collection</TableCell>
      <TableCell>Added Date</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  );

  const rowContent = (_index, row) => (
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selectedBooks.includes(row.id)}
          onChange={() => handleSelectBook(row.id)}
        />
      </TableCell>
      <TableCell>{row.title}</TableCell>
      <TableCell>{row.author}</TableCell>
      <TableCell>{row.category.join(', ')}</TableCell>
      <TableCell>{row.collection}</TableCell>
      <TableCell>{row.addDate.toDate().toLocaleDateString()}</TableCell>
      <TableCell>
        <IconButton onClick={() => { setSelectedBook(row); setOpen(true); }}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={() => handleDelete(row.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

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
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortField}
            onChange={(e) => handleSort(e.target.value)}
          >
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="author">Author</MenuItem>
            <MenuItem value="addDate">Date Added</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={() => handleSort(sortField)}>
          {sortOrder === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter By Author</InputLabel>
          <Select
            multiple
            value={selectedAuthors}
            onChange={(e) => setSelectedAuthors(e.target.value)}
            input={<OutlinedInput label="Filter By Author" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {[...new Set(books.map(book => book.author))].map((author) => (
              <MenuItem key={author} value={author}>
                {author}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter By Category</InputLabel>
          <Select
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value)}
            input={<OutlinedInput label="Filter By Category" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter By Collection</InputLabel>
          <Select
            multiple
            value={selectedCollections}
            onChange={(e) => setSelectedCollections(e.target.value)}
            input={<OutlinedInput label="Filter By Collection" />}
            renderValue={(selected) => selected.join(', ')}
          >
            {[...new Set(books.map(book => book.collection))].map((collection) => (
              <MenuItem key={collection} value={collection}>
                {collection}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(e, newView) => setView(newView)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="list">List View</ToggleButton>
        <ToggleButton value="table">Table View</ToggleButton>
      </ToggleButtonGroup>
      {view === 'list' ? (
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          {loading ? (
            <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
          ) : (
            <List>
              {filteredBooks.map((book, index) => (
                <React.Fragment key={book.id}>
                  <ListItem>
                    <Checkbox
                      checked={selectedBooks.includes(book.id)}
                      onChange={() => handleSelectBook(book.id)}
                    />
                    <ListItemText
                      primary={book.title}
                      secondary={`Author: ${book.author} | Categories: ${book.category.join(', ')} | Added: ${book.addDate.toDate().toLocaleDateString()}`}
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
      ) : (
        <Paper style={{ height: 400, width: '100%' }}>
          <TableVirtuoso
            data={filteredBooks}
            components={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            itemContent={rowContent}
          />
        </Paper>
      )}
      <BookForm open={open} setOpen={setOpen} fetchBooks={fetchBooks} book={selectedBook} />
    </Box>
  );
};

export default BooksManagement;