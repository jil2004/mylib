import React from 'react';
import { db } from '../../firebase/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, Typography, Button, Grid, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const BookList = ({ books, fetchBooks, setSelectedBook, setOpen }) => {
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'Books', id));
    fetchBooks();
  };

  return (
    <Grid container spacing={3}>
      {books.map(book => (
        <Grid item xs={12} md={4} key={book.id}>
          <Card sx={{ boxShadow: 3, '&:hover': { boxShadow: 6 } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{book.name}</Typography>
              <Typography variant="body1" color="text.secondary">{book.author}</Typography>
              <Typography variant="body2" color="text.secondary">
                Category: {book.category?.join(', ') || 'No categories'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Added: {book.addDate?.toDate().toLocaleDateString()}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <IconButton onClick={() => { setSelectedBook(book); setOpen(true); }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(book.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BookList;