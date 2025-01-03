import React from 'react';
import { db } from '../../firebase/firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, Typography, Button, Grid } from '@mui/material';

const BorrowerList = ({ borrowers, fetchBorrowers }) => {
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'Borrowers', id));
    fetchBorrowers();
  };

  return (
    <Grid container spacing={3}>
      {borrowers.map(borrower => (
        <Grid item xs={12} md={4} key={borrower.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{borrower.name}</Typography>
              <Typography>{borrower.email}</Typography>
              <Button onClick={() => handleDelete(borrower.id)}>Delete</Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default BorrowerList;