import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  LibraryBooks,
  People,
  TrendingUp,
  Person
} from '@mui/icons-material';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBorrowers: 0,
    monthlyChange: {
      books: 0,
      borrowers: 0
    }
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentBorrowers, setRecentBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Get current date and date 30 days ago
      const now = Timestamp.now();
      const thirtyDaysAgo = Timestamp.fromDate(new Date(now.toDate().setDate(now.toDate().getDate() - 30)));

      // Fetch books data
      const booksRef = collection(db, 'Users', user.uid, 'books');
      const booksQuery = query(booksRef, orderBy('addDate', 'desc'));
      const booksSnapshot = await getDocs(booksQuery);

      // Fetch borrowers data
      const borrowersRef = collection(db, 'Users', user.uid, 'borrowers');
      const borrowersQuery = query(borrowersRef, orderBy('borrowDate', 'desc'));
      const borrowersSnapshot = await getDocs(borrowersQuery);

      // Extract books data
      const booksData = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Create a map of book IDs to titles for quick lookup
      const bookIdToTitleMap = booksData.reduce((map, book) => {
        map[book.id] = book.title;
        return map;
      }, {});

      // Extract borrowers data
      const borrowersData = borrowersSnapshot.docs.map(doc => {
        const borrowerData = doc.data();

        // Get borrowed book titles using the borrowedBooks array
        const borrowedBooks = borrowerData.borrowedBooks && borrowerData.borrowedBooks.length > 0
          ? borrowerData.borrowedBooks
              .map(bookId => bookIdToTitleMap[bookId] || 'N/A') // Map book IDs to titles
              .join(', ') // Join titles into a single string
          : 'No books borrowed';

        return {
          id: doc.id,
          name: borrowerData.name || 'N/A',
          borrowedBooks,
          borrowDate: borrowerData.borrowDate?.toDate().toLocaleDateString('en-GB') || 'N/A',
        };
      });

      // Calculate monthly changes
      const monthlyNewBooks = booksData.filter(
        book => book.addDate.toDate() > thirtyDaysAgo.toDate()
      ).length;

      const monthlyNewBorrowers = borrowersData.filter(
        borrower => borrower.borrowDate && new Date(borrower.borrowDate) > thirtyDaysAgo.toDate()
      ).length;

      // Set states
      setStats({
        totalBooks: booksData.length,
        totalBorrowers: borrowersData.length,
        monthlyChange: {
          books: monthlyNewBooks,
          borrowers: monthlyNewBorrowers
        }
      });

      // Get recent 5 books and borrowers
      setRecentBooks(booksData.slice(0, 5));
      setRecentBorrowers(borrowersData.slice(0, 5));

      // Debugging: Log fetched data
      console.log('Books Data:', booksData);
      console.log('Borrowers Data:', borrowersData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, change }) => (
    <Card sx={{
      borderRadius: 2,
      boxShadow: 3,
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
          {value}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: change > 0 ? 'success.main' : 'text.secondary',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {change > 0 && <TrendingUp sx={{ mr: 0.5, fontSize: 16 }} />}
          {change > 0 ? `+${change} in last 30 days` : 'No change in last 30 days'}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Library Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={6}>
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            icon={<LibraryBooks sx={{ color: 'primary.main' }} />}
            change={stats.monthlyChange.books}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <StatCard
            title="Total Borrowers"
            value={stats.totalBorrowers}
            icon={<People sx={{ color: 'primary.main' }} />}
            change={stats.monthlyChange.borrowers}
          />
        </Grid>

        {/* Recent Activities Cards */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <LibraryBooks sx={{ mr: 1 }} />
                Recently Added Books
              </Typography>
              <List>
                {recentBooks.map((book, index) => (
                  <React.Fragment key={book.id}>
                    <ListItem>
                      <ListItemText
                        primary={book.title}
                        secondary={`Author: ${book.author} | Added: ${book.addDate?.toDate().toLocaleDateString('en-GB')}`}
                      />
                    </ListItem>
                    {index < recentBooks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                New Borrowers
              </Typography>
              <List>
                {recentBorrowers.map((borrower, index) => (
                  <React.Fragment key={borrower.id}>
                    <ListItem>
                      <ListItemText
                        primary={borrower.name}
                        secondary={`Borrowed Books: ${borrower.borrowedBooks} | Borrowed On: ${borrower.borrowDate}`}
                      />
                    </ListItem>
                    {index < recentBorrowers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;