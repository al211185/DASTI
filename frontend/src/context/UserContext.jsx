// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Función para obtener el perfil del usuario
  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
    }
  };

  // Puedes llamar a fetchUserProfile, por ejemplo, cuando el componente se monta
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
