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

  // Llamar a fetchUserProfile cuando se monta el componente
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Puedes derivar los permisos directamente del objeto usuario.
  // Si el usuario tiene la propiedad "rol" y ésta contiene el array "permisos",
  // en caso contrario, devuelve un array vacío.
  const permissions = user && user.rol && user.rol.permisos ? user.rol.permisos : [];

  return (
    <UserContext.Provider value={{ user, setUser, permissions }}>
      {children}
    </UserContext.Provider>
  );
};
