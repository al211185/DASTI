// src/components/Dashboard/HistorialCambios.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useParams } from 'react-router-dom';

const HistorialCambios = () => {
  // Se asume que la ruta incluye el ID de la cotización: /dashboard/cotizacion/:id/historial
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await axiosInstance.get(`/cotizaciones/${id}/historial`);
        setHistorial(res.data.historialCambios);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al obtener historial');
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [id]);

  if (loading) return <div>Cargando historial...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Historial de Cambios</h2>
      {historial.length === 0 ? (
        <p>No hay cambios registrados.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Campo</th>
              <th className="p-2 border">Valor Anterior</th>
              <th className="p-2 border">Valor Nuevo</th>
              <th className="p-2 border">Usuario</th>
              <th className="p-2 border">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((cambio, index) => (
              <tr key={index}>
                <td className="p-2 border">{cambio.campo}</td>
                <td className="p-2 border">{cambio.valorAnterior}</td>
                <td className="p-2 border">{cambio.valorNuevo}</td>
                <td className="p-2 border">{cambio.usuario}</td>
                <td className="p-2 border">{new Date(cambio.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistorialCambios;
