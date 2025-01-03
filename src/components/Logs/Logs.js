import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Typography, Card, CardContent, TextField, List, ListItem, ListItemText, Divider } from '@mui/material';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const logsSnapshot = await getDocs(collection(db, 'Logs'));
    const logsData = logsSnapshot.docs.map(doc => doc.data());
    setLogs(logsData);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredLogs = logs.filter(log =>
    (log.bookName?.toLowerCase() || '').includes(searchTerm) ||
    (log.borrowerName?.toLowerCase() || '').includes(searchTerm)
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
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <List>
          {filteredLogs.map((log, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={`${log.bookName || 'Unknown Book'} borrowed by ${log.borrowerName || 'Unknown Borrower'}`}
                  secondary={`Borrow Date: ${log.borrowDate?.toDate().toLocaleDateString()} | Return Date: ${log.returnDate?.toDate().toLocaleDateString() || 'Not returned'}`}
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