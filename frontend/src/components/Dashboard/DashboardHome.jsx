// src/components/Dashboard/DashboardHome.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { UserContext } from '../../context/UserContext';
import ModalAprobacionRechazo from './ModalAprobacionRechazo';
import CotizacionesTable from './CotizacionesTable';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const userRole = user.rol.nombre.toLowerCase(); // 'vendedores' | 'administrador' | 'director'
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalData, setModalData] = useState({
    open: false,
    cotizacionId: null,
    currentState: '',
    action: '',   // 'approve' | 'edit' | 'delete'
  });

  useEffect(() => {
    axiosInstance.get('/cotizaciones')
      .then(res => setCotizaciones(res.data.cotizaciones))
      .catch(err => setError(err.response?.data?.msg || 'Error'))
      .finally(() => setLoading(false));
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


  const requestApproval = async ({ cotizacionId, action }) => {
    try {
      await axiosInstance.post(`/cotizaciones/${cotizacionId}/solicitar-aprobacion`, { action });
      alert('Tu solicitud ha sido enviada para aprobación.');
    } catch (err) {
      console.error('Error al solicitar aprobación:', err);
      alert('No se pudo enviar la solicitud.');
    }
  };

  const handleVendorAction = async ({ cotizacionId, action }) => {
    try {
      // 1. Traer TODO el historial de la cotización
      const { data } = await axiosInstance.get(`/cotizaciones/${cotizacionId}/historial`);
      // 2. Filtrar sólo las entradas de solicitud_edit / solicitud_delete
      const myReqs = data.historial
        .filter(h => h.action === `solicitud_${action}`)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // 3. Sin ninguna → pido aprobación
      if (myReqs.length === 0) {
        return requestApproval({ cotizacionId, action });
      }

      const latest = myReqs[0];
      switch (latest.estadoSolicitud) {
        case 'pendiente':
          return alert('Tu solicitud está pendiente de aprobación.');
        case 'rechazada':
          return alert('Tu solicitud fue rechazada.');
        case 'aprobada':
          // DESBLOQUEO la acción
          if (action === 'edit') {
            navigate(`/dashboard/editar-cotizacion/${cotizacionId}`);
          } else if (action === 'delete') {
            await axiosInstance.delete(`/cotizaciones/${cotizacionId}`);
            setCotizaciones(cs => cs.filter(c => c._id !== cotizacionId));
          }
          return;
      }
    } catch (err) {
      console.error('Error al verificar historial:', err);
      alert('No se pudo verificar la solicitud.');
    }
  };

  const handleOpenModalAprobacion = ({ cotizacionId, currentState, action }) => {
    // Si es vendedor y quiere editar o eliminar, pasamos por el flujo de solicitud/aprobación:
    if (userRole === 'vendedores' && (action === 'edit' || action === 'delete')) {
      return handleVendorAction({ cotizacionId, action });
    }

    // Si es admin o director y la acción es "edit" o "delete", la hacen directamente:
    if ((userRole === 'administrador' || userRole === 'director') && action === 'edit') {
      return navigate(`/dashboard/editar-cotizacion/${cotizacionId}`);
    }
    if ((userRole === 'administrador' || userRole === 'director') && action === 'delete') {
      // borra y actualiza lista
      axiosInstance.delete(`/cotizaciones/${cotizacionId}`)
        .then(() => setCotizaciones(cs => cs.filter(c => c._id !== cotizacionId)))
        .catch(console.error);
      return;
    }


    // Jefe de producción → **solo** edit directo
    if (userRole === 'jefe de produccion' && action === 'edit') {
      return navigate(`/dashboard/editar-cotizacion/${cotizacionId}`);
    }

    // Si es admin/director y quiere "approve" (cambiar estado), abrimos modal
    if ((userRole === 'administrador' || userRole === 'director') && action === 'approve') {
      return setModalData({ open: true, cotizacionId, currentState, action });
    }

    // Cualquier otro caso (p.ej. duplicar, ver) no pasa por aquí
  };

  const handleAprobarRechazar = async ({ estado, comentario }) => {
    const { cotizacionId, action } = modalData;
    try {
      if (action === 'approve') {
        const res = await axiosInstance.put(`/cotizaciones/${cotizacionId}`, { estado, comentario });
        setCotizaciones(cs =>
          cs.map(c => c._id === cotizacionId ? res.data.cotizacion : c)
        );
      }
      else if (action === 'edit') {
        navigate(`/dashboard/editar-cotizacion/${cotizacionId}`);
      }
      else if (action === 'delete') {
        await axiosInstance.delete(`/cotizaciones/${cotizacionId}`);
        setCotizaciones(cs => cs.filter(c => c._id !== cotizacionId));
      }
    } catch (err) {
      console.error('Error en aprobación:', err.response?.data || err);
    } finally {
      setModalData({ open: false, cotizacionId: null, currentState: '', action: '' });
    }
  };

  if (loading) return <div className="p-4">Cargando cotizaciones…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Listado de Cotizaciones</h2>

      <CotizacionesTable
        cotizaciones={cotizaciones}
        userRole={userRole}
        onOpenModalAprobacion={handleOpenModalAprobacion}
        onDuplicar={handleDuplicar}
        onVerCotizacion={id => navigate(`/dashboard/cotizacion/${id}`)}
        onEliminarCotizacion={id => handleOpenModalAprobacion({ cotizacionId: id, action: 'delete' })}
      />

      {modalData.open && (
        <ModalAprobacionRechazo
          action={modalData.action}
          currentState={modalData.currentState}
          onClose={() => setModalData({ open: false, cotizacionId: null, currentState: '', action: '' })}
          onSubmit={handleAprobarRechazar}
        />
      )}
    </div>
  );
};

export default DashboardHome;
