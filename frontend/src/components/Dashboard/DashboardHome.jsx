// src/components/Dashboard/DashboardHome.jsx
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ModalAprobacionRechazo from './ModalAprobacionRechazo';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalData, setModalData] = useState({ open: false, cotizacionId: null, currentState: '' });

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

  const handleAprobarRechazar = async ({ estado, comentario }) => {
    try {
      // Actualiza la cotización con el nuevo estado y agrega el comentario en el historial (aquí simplificamos)
      const res = await axiosInstance.put(`/cotizaciones/${modalData.cotizacionId}`, {
        estado,
        comentario,
      });
      // Actualiza la lista local, por ejemplo, filtrando o mapeando el array
      setCotizaciones((prev) =>
        prev.map((cot) =>
          cot._id === modalData.cotizacionId ? res.data.cotizacion : cot
        )
      );
      setModalData({ open: false, cotizacionId: null, currentState: '' });
    } catch (err) {
      console.error('Error al actualizar estado:', err.response?.data || err.message);
    }
  };

  if (loading) return <div>Cargando cotizaciones...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Listado de Cotizaciones</h2>
      {cotizaciones.length === 0 ? (
        <p>No hay cotizaciones registradas.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Fecha de inicio</th>
              <th className="p-2 border">Planta</th>
              <th className="p-2 border">Serial</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cotizaciones.map((cot) => (
              <tr key={cot._id}>
                <td className="p-2 border">{cot.cliente}</td>
                <td className="p-2 border">{new Date(cot.fechaInicio).toLocaleDateString()}</td>
                <td className="p-2 border">{cot.planta}</td>
                <td className="p-2 border">{cot.serial}</td>
                <td className="p-2 border">${cot.total.toFixed(2)}</td>
                <td className="p-2 border">{cot.estado}</td>
                <td className="p-2 border text-center">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    onClick={() =>
                      setModalData({ open: true, cotizacionId: cot._id, currentState: cot.estado })
                    }
                  >
                    Aprobar/Rechazar
                  </button>
                </td>
                <td className="p-2 border text-center">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => navigate(`/dashboard/editar-cotizacion/${cot._id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => navigate(`/dashboard/cotizacion/${cot._id}/historial`)}
                  >
                    Ver Historial
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

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
