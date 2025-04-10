// src/hooks/usePermissions.js
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';

export const usePermissions = () => {
  const { permissions } = useContext(UserContext);

  // Función que verifica un permiso dado. Si el usuario tiene 'todo' se le concede acceso completo.
  const hasPermission = (permiso) => {
    if (permissions.includes('todo')) return true;
    return permissions.includes(permiso);
  };

  return { hasPermission, permissions };
};
