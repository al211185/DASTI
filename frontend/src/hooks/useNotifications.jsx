// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoti = async () => {
      try {
        const { data } = await axiosInstance.get('/notificaciones');
        // Suponemos que la API devuelve un array en data.notificaciones
        setNotifications(data.notificaciones);
      } catch (err) {
        console.error('Error al cargar notificaciones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNoti();
  }, []);

  return { notifications, setNotifications, loading };
}
