// src/utils/firebaseUtils.js
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Function to add logs
export const addLog = async (type, bookID, borrowerID, details) => {
  const auth = getAuth();
  const user = auth.currentUser;

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