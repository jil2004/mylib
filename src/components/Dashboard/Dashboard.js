import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';

const Dashboard = () => {
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalBorrowers, setTotalBorrowers] = useState(0);
  const [recentlyBorrowed, setRecentlyBorrowed] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const booksSnapshot = await getDocs(collection(db, 'Books'));
    setTotalBooks(booksSnapshot.size);

    const borrowersSnapshot = await getDocs(collection(db, 'Borrowers'));
    setTotalBorrowers(borrowersSnapshot.size);

    const logsSnapshot = await getDocs(collection(db, 'Logs'));
    setRecentlyBorrowed(logsSnapshot.size);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Books</Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>{totalBooks}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>+5 books from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Total Borrowers</Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>{totalBorrowers}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>+3 borrowers from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recently Borrowed</Typography>
              <Typography variant="h4" sx={{ color: 'primary.main' }}>{recentlyBorrowed}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>+1 book from yesterday</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;