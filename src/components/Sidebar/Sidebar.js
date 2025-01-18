import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Typography, Box, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Link } from 'react-router-dom';

const Sidebar = ({ darkMode }) => {
  const [open, setOpen] = useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 56,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 56,
          boxSizing: 'border-box',
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
          transition: 'width 0.3s ease, background-color 0.3s, color 0.3s',
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          color: darkMode ? '#ffffff' : '#000000',
        }}
      >
        <Typography variant="h6" sx={{ display: open ? 'block' : 'none' }}>
          MyLib
        </Typography>
        <IconButton onClick={toggleDrawer} sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
          <MenuIcon />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: darkMode ? '#333333' : '#e0e0e0' }} />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
        <ListItem button component={Link} to="/books">
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
            <BookIcon />
          </ListItemIcon>
          <ListItemText primary="Books" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
        <ListItem button component={Link} to="/borrowers">
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Borrowers" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
        <ListItem button component={Link} to="/logs">
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000' }}>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Logs" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;