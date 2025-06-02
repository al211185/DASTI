// src/components/Dashboard/DashboardHome.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { UserContext } from '../../context/UserContext';
import ModalAprobacionRechazo from './ModalAprobacionRechazo';
import CotizacionesTable from './CotizacionesTable';
import ModalComentarios from './NuevaCotizacion/modals/ModalComentarios';  // ← 1) importar


const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  

  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [estadoFilter, setEstadoFilter]     = useState('');   // cadena vacía = “todos”
  const [fechaDesde, setFechaDesde]         = useState('');
  const [fechaHasta, setFechaHasta]         = useState('');
  const [plantaFilter, setPlantaFilter]     = useState('');   // cadena vacía = “todas”
  const [serialFilter, setSerialFilter]     = useState('');   // búsqueda de texto libre
  const [sortClienteAZ, setSortClienteAZ]   = useState(false); // si true, orden alfabético A→Z

  const [modalData, setModalData] = useState({
    open: false,
    cotizacionId: null,
    currentState: '',
    action: '',   // 'approve' | 'edit' | 'delete'
  });

  // ** NUEVO: estado para los comentarios **
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);
  const [currentCotizacionId, setCurrentCotizacionId] = useState(null);

  useEffect(() => {
    axiosInstance.get('/cotizaciones')
      .then(res => setCotizaciones(res.data.cotizaciones))
      .catch(err => setError(err.response?.data?.msg || 'Error'))
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return <div className="p-4">Cargando usuario…</div>;
  }
  
  
  const userRole = user.rol.nombre.toLowerCase(); // 'vendedores' | 'administrador' | 'director'

  const isVendor    = userRole === 'vendedores';
  const isAdmin     = userRole === 'administrador';
  const isDirector  = userRole === 'director';

  // Solo estos tres ven las cards:
  const showSummary = isVendor || isAdmin || isDirector;

  // Si es vendedor, limitar a sus propias cotizaciones:
  const summaryCotizaciones = isVendor
    ? cotizaciones.filter(c => c.vendedor?._id === user._id)
    : cotizaciones;

    const pendingCount   = summaryCotizaciones.filter(c => c.estado === 'Pendiente de aprobación').length;
  const approvedCount  = summaryCotizaciones.filter(c => c.estado === 'Aprobado').length;
  const rejectedCount  = summaryCotizaciones.filter(c => c.estado === 'Rechazado').length;
  const totalCount     = summaryCotizaciones.length;

  const filteredCotizaciones = cotizaciones
    .filter(c => {
      // → FILTRO POR ESTADO (si hubo selección)
      if (estadoFilter && c.estado !== estadoFilter) return false;

      // → FILTRO POR RANGO DE FECHA
      const fechaC = new Date(c.fechaInicio); // objeto Date de la cotización
      if (fechaDesde) {
        const desde = new Date(fechaDesde + 'T00:00:00'); 
        if (fechaC < desde) return false;
      }
      if (fechaHasta) {
        // ajustar fechaHasta para incluir todo el día (hasta 23:59:59)
        const hasta = new Date(fechaHasta + 'T23:59:59');
        if (fechaC > hasta) return false;
      }

      // → FILTRO POR PLANTA (suponiendo que “c.planta.nombre” existe)
      if (plantaFilter && c.planta?.nombre !== plantaFilter) return false;

      // → FILTRO POR SERIAL (búsqueda “incluye”)
      if (serialFilter) {
        if (!c.serial.toLowerCase().includes(serialFilter.toLowerCase())) {
          return false;
        }
      }

      // Si llega hasta aquí, pasa los filtros:
      return true;
    })
    // 2) Orden alfabético de cliente si el switch sortClienteAZ es true:
    .sort((a, b) => {
      if (!sortClienteAZ) return 0; // sin ordenar
      const nameA = a.cliente.nombre.toLowerCase();
      const nameB = b.cliente.nombre.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

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
          // Pregunto si quiere reenviar o lo hago automáticamente:
          if (window.confirm('Tu solicitud fue rechazada. ¿Deseas enviarla de nuevo?')) {
            return requestApproval({ cotizacionId, action });
          }
          return;
        case 'aprobada':
          // DESBLOQUEO la acción
          if (action === 'edit') {
            navigate(`/dashboard/editar-cotizacion/${cotizacionId}`);
          } else if (action === 'delete') {
            await axiosInstance.delete(`/cotizaciones/${cotizacionId}`);
            setCotizaciones(cs => cs.filter(c => c._id !== cotizacionId));
          }
          return;
        default:
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

    // Jefe de producción → **solo** edit directo
    if (userRole === 'disenador' && action === 'edit') {
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

  // ** NUEVO: carga comentarios y abre modal **
  const handleComments = async (cotizacionId) => {
    try {
      const res = await axiosInstance.get(`/cotizaciones/${cotizacionId}/comentarios`);
      setCurrentComments(res.data.comentarios);
      setCurrentCotizacionId(cotizacionId);
      setCommentModalOpen(true);
    } catch (err) {
      console.error('Error al obtener comentarios:', err);
    }
  };

  // ** NUEVO: añade un comentario y recarga la lista **
  const handleAddComment = async (texto) => {
    try {
      await axiosInstance.post(
        `/cotizaciones/${currentCotizacionId}/comentarios`,
        { texto }
      );
      // recarga
      const res = await axiosInstance.get(`/cotizaciones/${currentCotizacionId}/comentarios`);
      setCurrentComments(res.data.comentarios);
    } catch (err) {
      console.error('Error al agregar comentario:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Cargando cotizaciones…</p>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto bg-white border rounded-2xl shadow-lg p-6">

      {/* Cards de resumen */}
      {showSummary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pendientes */}
          <div className="flex items-center p-4 bg-yellow-50 rounded-lg shadow">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-700">Pendientes de aprobación</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{pendingCount}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              {/* Icono opcional */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Aprobadas */}
          <div className="flex items-center p-4 bg-green-50 rounded-lg shadow">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">Aprobadas</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{approvedCount}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Rechazadas */}
          <div className="flex items-center p-4 bg-red-50 rounded-lg shadow">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Rechazadas</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{rejectedCount}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de cotizaciones</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{totalCount}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </div>
          </div>
        </div>
      )}
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold text-gray-800">
            Listado de Cotizaciones
          </h2>
          <button
            onClick={() => navigate('/dashboard/nueva-cotizacion')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition mt-4 md:mt-0"
          >
            Nueva Cotización
          </button>
        </div>

        {/* ─── COMIENZO CONTROLES DE FILTRO ─── */}
       <div className="mb-6 bg-white border border-gray-200 rounded-2xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* FILTRO ESTADO */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={estadoFilter}
                onChange={e => setEstadoFilter(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="Pendiente de aprobación">Pendiente de aprobación</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>

            {/* FILTRO FECHA DESDE */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={e => setFechaDesde(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILTRO FECHA HASTA */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={e => setFechaHasta(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILTRO PLANTA */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Planta</label>
              <select
                value={plantaFilter}
                onChange={e => setPlantaFilter(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="Planta Norte">Planta Norte</option>
                <option value="Planta Sur">Planta Sur</option>
                <option value="Planta Central">Planta Central</option>
              </select>
            </div>

            {/* FILTRO SERIAL */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Serial</label>
              <input
                type="text"
                placeholder="Buscar serial…"
                value={serialFilter}
                onChange={e => setSerialFilter(e.target.value)}
                className="h-10 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SWITCH ORDEN ALFABÉTICO */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={sortClienteAZ}
                  onChange={e => setSortClienteAZ(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ordenar clientes A → Z</span>
              </label>
            </div>
          </div>
        </div>
       {/* ─── FIN CONTROLES DE FILTRO ─── */}

        {/* Tabla */}
        <div className="overflow-x-auto">
          <CotizacionesTable
            cotizaciones={filteredCotizaciones}
            userRole={userRole}
            onOpenModalAprobacion={handleOpenModalAprobacion}
            onDuplicar={handleDuplicar}
            onVerCotizacion={id => navigate(`/dashboard/cotizacion/${id}`)}
            onEliminarCotizacion={id =>
              handleOpenModalAprobacion({ cotizacionId: id, action: 'delete' })
            }
            onComments={handleComments}
          />
        </div>

        {/* Modales */}
        {modalData.open && (
          <ModalAprobacionRechazo
            action={modalData.action}
            currentState={modalData.currentState}
            onClose={() =>
              setModalData({ open: false, cotizacionId: null, currentState: '', action: '' })
            }
            onSubmit={handleAprobarRechazar}
          />
        )}
        {commentModalOpen && (
          <ModalComentarios
            comentarios={currentComments}
            usuario={user.nombre || user.email}
            onClose={() => setCommentModalOpen(false)}
            onAgregarComentario={handleAddComment}
          />
        )}
      </div>
    </div>
  )
}

export default DashboardHome
