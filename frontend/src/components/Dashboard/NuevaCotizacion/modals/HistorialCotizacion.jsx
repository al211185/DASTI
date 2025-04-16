import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';

const HistorialCotizacion = ({ cotizacionId, onClose }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const response = await axiosInstance.get(`/cotizaciones/${cotizacionId}/historial`);
        setHistorial(response.data.historial || []);
      } catch (error) {
        console.error('Error al obtener el historial:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [cotizacionId]);

  const renderCambio = (cambio, idx) => {
    const { campo, valorAnterior, valorNuevo, usuario } = cambio;

    // Renglones: desglosar lista cantidad×descripción
    if (campo === 'renglones') {
      const prevItems = String(valorAnterior || '').split(',').map(s => s.trim()).filter(Boolean);
      const newItems = String(valorNuevo || '').split(',').map(s => s.trim()).filter(Boolean);
      return (
        <li key={idx} className="mb-4">
          <strong>Renglones:</strong>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <div>
              <p className="underline text-sm">Anterior</p>
              <ul className="list-decimal list-inside text-sm">
                {prevItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="underline text-sm">Nuevo</p>
              <ul className="list-decimal list-inside text-sm">
                {newItems.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Por {usuario}</p>
        </li>
      );
    }

    // Comentarios
    if (campo.includes('comentarios')) {
      const prevCom = Array.isArray(valorAnterior) ? valorAnterior.map(c => c.texto) : [];
      const newCom = Array.isArray(valorNuevo) ? valorNuevo.map(c => c.texto) : [];
      return (
        <li key={idx} className="mb-4">
          <strong>Comentarios:</strong>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div>
              <p className="underline text-sm">Anterior</p>
              <p className="text-sm">{prevCom.join(', ') || '—'}</p>
            </div>
            <div>
              <p className="underline text-sm">Nuevo</p>
              <p className="text-sm">{newCom.join(', ') || '—'}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Por {usuario}</p>
        </li>
      );
    }

    // Documentos
    if (campo.includes('documentos')) {
      const prevDocs = Array.isArray(valorAnterior) ? valorAnterior.map(d => d.originalName || d.url) : [];
      const newDocs = Array.isArray(valorNuevo) ? valorNuevo.map(d => d.originalName || d.url) : [];
      return (
        <li key={idx} className="mb-4">
          <strong>Documentos:</strong>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <div>
              <p className="underline text-sm">Anterior</p>
              <p className="text-sm">{prevDocs.join(', ') || '—'}</p>
            </div>
            <div>
              <p className="underline text-sm">Nuevo</p>
              <p className="text-sm">{newDocs.join(', ') || '—'}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Por {usuario}</p>
        </li>
      );
    }

    // Default para otros campos
    return (
      <li key={idx} className="mb-2">
        <strong>{campo.replace(/>/g, ' - ')}:</strong> <em>{String(valorAnterior)}</em> → <em>{String(valorNuevo)}</em>
        <span className="text-xs text-gray-500"> por {usuario}</span>
      </li>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
      <div className="bg-white p-4 max-w-2xl rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Historial de la Cotización</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">Cerrar</button>
        </div>
        {loading ? (
          <p>Cargando historial...</p>
        ) : (
          <div className="overflow-y-auto max-h-96">
            {historial.length === 0 ? (
              <p>No hay historial disponible.</p>
            ) : (
              historial.map((entry, idx) => (
                <div key={idx} className="border-b py-2">
                  <p><strong>Versión:</strong> {entry.version} - <strong>Acción:</strong> {entry.action}</p>
                  <p><strong>Fecha:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
                  <div className="mt-2">
                    <strong>Cambios:</strong>
                    <ul className="ml-4 list-disc">
                      {entry.cambios.map(renderCambio)}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialCotizacion;
