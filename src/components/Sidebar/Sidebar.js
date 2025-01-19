import { React, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookIcon from '@mui/icons-material/Book';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';

const Sidebar = ({ darkMode }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation(); // Get the current route location

  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Function to check if the current route matches the link
  const isActive = (path) => {
    return location.pathname === path;
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
        <ListItem
          button
          component={Link}
          to="/"
          sx={{
            backgroundColor: isActive('/') ? (darkMode ? '#333333' : '#e0e0e0') : 'inherit',
            '&:hover': {
              backgroundColor: darkMode ? '#333333' : '#e0e0e0',
            },
            py: 1, // Reduce vertical padding
            pl: 2, // Reduce left padding
          }}
        >
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000', minWidth: '40px' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText
            primary="Dashboard"
            sx={{ display: open ? 'block' : 'none', ml: -1 }} // Reduce space between icon and text
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/books"
          sx={{
            backgroundColor: isActive('/books') ? (darkMode ? '#333333' : '#e0e0e0') : 'inherit',
            '&:hover': {
              backgroundColor: darkMode ? '#333333' : '#e0e0e0',
            },
            py: 1,
            pl: 2,
          }}
        >
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000', minWidth: '40px' }}>
            <BookIcon />
          </ListItemIcon>
          <ListItemText primary="Books" sx={{ display: open ? 'block' : 'none', ml: -1 }} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/borrowers"
          sx={{
            backgroundColor: isActive('/borrowers') ? (darkMode ? '#333333' : '#e0e0e0') : 'inherit',
            '&:hover': {
              backgroundColor: darkMode ? '#333333' : '#e0e0e0',
            },
            py: 1,
            pl: 2,
          }}
        >
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000', minWidth: '40px' }}>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Borrowers" sx={{ display: open ? 'block' : 'none', ml: -1 }} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/logs"
          sx={{
            backgroundColor: isActive('/logs') ? (darkMode ? '#333333' : '#e0e0e0') : 'inherit',
            '&:hover': {
              backgroundColor: darkMode ? '#333333' : '#e0e0e0',
            },
            py: 1,
            pl: 2,
          }}
        >
          <ListItemIcon sx={{ color: darkMode ? '#ffffff' : '#000000', minWidth: '40px' }}>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Logs" sx={{ display: open ? 'block' : 'none', ml: -1 }} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;