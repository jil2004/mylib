import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Box, Typography, Card, CardContent, TextField, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import { getAuth } from 'firebase/auth';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  // Fetch logs from Firestore
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const logsSnapshot = await getDocs(collection(db, 'Logs'));
      const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
    }
  };

  // Add a log to Firestore
  const addLog = async (type, bookID, borrowerID, details) => {
    if (!user) {
      console.error('User not logged in.');
      return;
    }

    const logData = {
      type,
      bookID,
      borrowerID,
      timestamp: serverTimestamp(),
      details,
    };

    try {
      const logsRef = collection(db, 'Logs');
      await addDoc(logsRef, logData);
      console.log('Log added successfully!');
    } catch (error) {
      console.error('Error adding log:', error.message);
    }
  };

  // Example usage of addLog
  const handleAddLog = async () => {
    await addLog('TEST_LOG', null, null, 'This is a test log.');
    fetchLogs(); // Refresh logs after adding a new one
  };

  // Filter logs based on search term
  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredLogs = logs.filter(log =>
    (log.details?.toLowerCase() || '').includes(searchTerm)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Logs</Typography>
      <TextField
        label="Search Logs"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ width: '300px', mb: 3 }}
      />
      <Button variant="contained" onClick={handleAddLog} sx={{ mb: 3 }}>
        Add Test Log
      </Button>
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <List>
          {filteredLogs.map((log, index) => (
            <React.Fragment key={log.id}>
              <ListItem>
                <ListItemText
                  primary={log.details}
                  secondary={`Type: ${log.type} | Timestamp: ${log.timestamp?.toDate().toLocaleString()}`}
                />
              </ListItem>
              {index < filteredLogs.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
};

export default Logs;