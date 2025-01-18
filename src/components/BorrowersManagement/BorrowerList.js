import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BookIcon from '@mui/icons-material/Book';

const BorrowerList = ({ borrowers, onEdit, onDeleteBorrower }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Borrowed Books</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {borrowers.map((borrower) => (
            <TableRow key={borrower.id}>
              <TableCell>
                <Typography variant="body1">{borrower.name}</Typography>
              </TableCell>
              <TableCell>
                {borrower.borrowedBooks && borrower.borrowedBooks.length > 0 ? (
                  borrower.borrowedBooks.map((book) => (
                    <Chip
                      key={book.id}
                      label={book.title}
                      icon={<BookIcon />}
                      sx={{ m: 0.5 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No books borrowed
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Tooltip title="Edit">
                  <IconButton onClick={() => onEdit(borrower)} color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => onDeleteBorrower(borrower.id, borrower.name, borrower.borrowedBooks)} // Pass borrower name and borrowed books
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BorrowerList;