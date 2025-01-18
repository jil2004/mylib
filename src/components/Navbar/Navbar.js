import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem, 
  Avatar, 
  Box,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Navbar = ({ darkMode, setDarkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const firstLetter = user?.displayName?.charAt(0).toUpperCase() || 'U';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate('/login');
    });
  };

  const handleProfileSettings = () => {
    handleMenuClose();
    navigate('/profile-settings');
  };

  return (
    <AppBar position="static" sx={{ bgcolor: darkMode ? '#121212' : '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          Library Management
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
          <Avatar sx={{ bgcolor: darkMode ? '#ff5722' : '#4caf50' }}>{firstLetter}</Avatar>
        </IconButton>
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              width: '250px',
              mt: 1.5
            }
          }}
        >
          {/* User Info Section */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.displayName || 'User'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {user?.email || 'No email'}
            </Typography>
          </Box>
          
          <Divider />
          
          {/* Menu Items */}
          <MenuItem onClick={handleProfileSettings}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile Settings</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;