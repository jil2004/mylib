import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import BooksManagement from './components/BooksManagement/BooksManagement';
import BorrowersManagement from './components/BorrowersManagement/BorrowersManagement';
import Logs from './components/Logs/Logs';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProfileSettings from './pages/ProfileSettings';
import VerifyEmail from './pages/VerifyEmail';
import { Box, CssBaseline, Typography } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
        secondary: darkMode ? '#b0b0b0' : '#555555',
      },
    },
  });

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <Typography>Loading...</Typography>; // Show loading indicator
    }

    if (!user) {
      return <Navigate to="/login" />; // Redirect to login if not authenticated
    }

    if (!user.emailVerified) {
      return <Navigate to="/verify-email" />; // Redirect to verify-email if email is not verified
    }

    return children; // Allow access to the protected route
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          {user && user.emailVerified && <Sidebar />}
          <Box component="main" sx={{ flexGrow: 1 }}>
            {user && user.emailVerified && <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />}
            <Box sx={{ p: 3 }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/books"
                  element={
                    <ProtectedRoute>
                      <BooksManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/borrowers"
                  element={
                    <ProtectedRoute>
                      <BorrowersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/logs"
                  element={
                    <ProtectedRoute>
                      <Logs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile-settings"
                  element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;