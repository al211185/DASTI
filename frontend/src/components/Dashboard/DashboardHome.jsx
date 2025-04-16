// src/components/Dashboard/DashboardHome.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ModalAprobacionRechazo from './ModalAprobacionRechazo';
import CotizacionesTable from './CotizacionesTable';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalData, setModalData] = useState({
    open: false,
    cotizacionId: null,
    currentState: '',
  });

  // Cargar todas las cotizaciones al montar
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

  // --------------------------------------------------
  // Función para duplicar una cotización
  // --------------------------------------------------
  const handleDuplicar = async (cotizacionId) => {
    try {
      // 1. Obtener la cotización original
      const res = await axiosInstance.get(`/cotizaciones/${cotizacionId}`);
      const cotizacionOriginal = res.data.cotizacion;

      // 2. Hacer un clon profundo (para evitar mutaciones de objetos anidados)
      const clon = JSON.parse(JSON.stringify(cotizacionOriginal));

      // 3. Eliminar campos que no quieras duplicar
      delete clon._id;
      delete clon.serial;
      delete clon.historialCambios;
      delete clon.fechaCreacion;
      // Elimina aquí cualquier otro campo que no desees copiar

      // 4. Armar la estructura esperada por "Nueva Cotización"
      const nuevaCotizacion = {
        header: {
          cliente: clon.cliente?._id || '',
          requisitor: clon.requisitor || '',
          vendedor: clon.vendedor?._id || '',
          fechaInicio: clon.fechaInicio || '',
          planta: clon.planta?._id || '',
          serial: '', // en blanco para que se genere uno nuevo
          tiempoEntregaMin: clon.tiempoEntregaMin || '',
          tiempoEntregaMax: clon.tiempoEntregaMax || '',
        },
        renglones: clon.renglones || [],
      };

      // 5. Navegar a la pantalla de "Nueva Cotización" con el estado duplicado
      navigate('/dashboard/nueva-cotizacion', { state: nuevaCotizacion });
    } catch (error) {
      console.error('Error al duplicar cotización:', error);
    }
  };

  // --------------------------------------------------
  // Función para ver una cotización (redirigir a su detalle)
  // --------------------------------------------------
  const handleVerCotizacion = (cotizacionId) => {
    navigate(`/dashboard/cotizacion/${cotizacionId}`);
  };

  // --------------------------------------------------
  // Función para eliminar una cotización
  // --------------------------------------------------
  const handleEliminarCotizacion = async (cotizacionId) => {
    if (!window.confirm('¿Está seguro de eliminar esta cotización?')) return;

    try {
      await axiosInstance.delete(`/cotizaciones/${cotizacionId}`);
      // Actualizar el estado local para quitar la cotización eliminada
      setCotizaciones((prev) => prev.filter((c) => c._id !== cotizacionId));
    } catch (err) {
      console.error('Error al eliminar la cotización:', err);
    }
  };

  // --------------------------------------------------
  // Funciones para aprobar/rechazar cotización
  // --------------------------------------------------
  const handleOpenModalAprobacion = ({ cotizacionId, currentState }) => {
    setModalData({ open: true, cotizacionId, currentState });
  };

  const handleAprobarRechazar = async ({ estado, comentario }) => {
    try {
      const res = await axiosInstance.put(
        `/cotizaciones/${modalData.cotizacionId}`,
        { estado, comentario },
      );
      // Actualizar el estado local con la cotización actualizada
      setCotizaciones((prev) =>
        prev.map((cot) =>
          cot._id === modalData.cotizacionId ? res.data.cotizacion : cot
        )
      );
      // Cerrar el modal
      setModalData({ open: false, cotizacionId: null, currentState: '' });
    } catch (err) {
      console.error('Error al actualizar estado:', err.response?.data || err.message);
    }
  };

  // --------------------------------------------------
  // Render: mostrar carga, error o la tabla
  // --------------------------------------------------
  if (loading) return <div>Cargando cotizaciones...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Listado de Cotizaciones</h2>

      <CotizacionesTable
        cotizaciones={cotizaciones}
        onOpenModalAprobacion={handleOpenModalAprobacion}
        onDuplicar={handleDuplicar}
        // Añadimos las funciones "Ver" y "Eliminar"
        onVerCotizacion={handleVerCotizacion}
        onEliminarCotizacion={handleEliminarCotizacion}
      />

      {modalData.open && (
        <ModalAprobacionRechazo
          onClose={() => setModalData({ open: false, cotizacionId: null, currentState: '' })}
          onSubmit={handleAprobarRechazar}
          currentState={modalData.currentState}
        />
      )}
    </div>
  );
};

export default DashboardHome;
