import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Box,
  Typography,
  Card,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Pagination,
  Stack,
} from '@mui/material';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const logsPerPage = 10; // Number of logs to display per page

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return; // Ensure user is logged in

    // Fetch logs and set up a real-time listener
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const logsQuery = query(collection(db, `Users/${user.uid}/logs`), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(logsQuery, (logsSnapshot) => {
          const logsData = logsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLogs(logsData);
          setLoading(false);
        });

        // Clean up the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching logs:', error.message);
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset to the first page when searching
  };

  const filteredLogs = logs.filter((log) =>
    log.action.toLowerCase().includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Logs
      </Typography>
      <TextField
        label="Search Logs"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ width: '300px', mb: 3 }}
      />
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        {loading ? (
          <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
        ) : (
          <>
            <List>
              {currentLogs.map((log, index) => (
                <React.Fragment key={log.id}>
                  <ListItem>
                    <ListItemText
                      primary={log.action}
                      secondary={`Timestamp: ${
                        log.timestamp ? log.timestamp.toDate().toLocaleString() : 'N/A'
                      }`}
                    />
                  </ListItem>
                  {index < currentLogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
            {filteredLogs.length > logsPerPage && (
              <Stack spacing={2} sx={{ p: 2, alignItems: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Stack>
            )}
          </>
        )}
      </Card>
    </Box>
  );
};

export default Logs;