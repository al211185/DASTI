// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axiosInstance.get('/auth/profile');
      setUser(data);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUserProfile().finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
