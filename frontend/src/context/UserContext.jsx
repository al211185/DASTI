// src/context/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // 1) Estado para el token
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Función que usará tu hook de login/logout para actualizar token y storage
  const saveToken = newToken => {
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
    setToken(newToken);
  };

  // Carga el perfil usando el token actual
  const fetchUserProfile = async () => {
    try {
      const resp = await axiosInstance.get('/auth/profile');
      setUser(resp.data);
    } catch (err) {
      console.error('Error al obtener perfil:', err);
      if (err.response?.status === 401) {
        // token inválido → limpiamos todo
        saveToken(null);
        setUser(null);
      }
    }
  };

  // 2) Efecto que depende de token
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    // inyecta header en axios
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUserProfile();
  }, [token]);

  const permissions = user?.rol?.permisos ?? [];

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      permissions,
      saveToken   // exportamos para que tu hook de auth lo use
    }}>
      {children}
    </UserContext.Provider>
  );
};
