// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    // Suponemos que /auth/profile retorna los datos completos del usuario, incluyendo el rol poblado.
    axiosInstance.get('/auth/profile', { withCredentials: true })
      .then((response) => {
        // Si se obtiene el perfil, el usuario está autenticado.
        setAuthenticated(true);

        // Si se ha definido allowedRoles, comprobamos el rol del usuario.
        // Se asume que la propiedad rol viene con la propiedad "nombre" del rol.
        if (allowedRoles.length > 0) {
          const userRole = response.data.rol?.nombre?.toLowerCase();
          const permitted = allowedRoles.map(role => role.toLowerCase()).includes(userRole);
          setHasRole(permitted);
        } else {
          // Si no se especificaron roles, se omite la comprobación.
          setHasRole(true);
        }
      })
      .catch(() => {
        setAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [allowedRoles]);

  if (loading) return <div>Cargando...</div>;

  // Si no está autenticado o no tiene el rol adecuado, se redirige
  if (!authenticated || !hasRole) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
