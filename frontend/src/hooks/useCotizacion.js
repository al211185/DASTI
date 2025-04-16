import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useCotizaciones = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        const res = await axiosInstance.get('/cotizaciones');
        setCotizaciones(res.data.cotizaciones);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al obtener cotizaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchCotizaciones();
  }, []);

  return { cotizaciones, loading, error, setCotizaciones };
};
