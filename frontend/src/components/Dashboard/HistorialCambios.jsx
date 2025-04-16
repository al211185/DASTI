import React, { useEffect, useState, Fragment } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useParams } from 'react-router-dom';
import { Upload, Download, Edit2, Trash2 } from 'lucide-react';

const HistorialCambios = () => {
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ---------------------------- carga de historial --------------------------- */
  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get(`/cotizaciones/${id}/historial`);
        setHistorial(res.data.historial || []);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error al obtener historial');
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [id]);

  /* ----------------------- presentación legible de valores -------------------- */
  const renderValue = (campo, val) => {
    if (val == null) return '—';

    // Renglones como lista “3× Tornillo”
    if (campo.startsWith('renglones') && Array.isArray(val)) {
      return val.map(r => `${r.cantidad}× ${r.descripcion}`).join(', ');
    }
    
    // Comentarios
    if (campo.includes('comentarios') && Array.isArray(val)) {
      return val.map(c => `"${c.texto}"`).join(', ');
    }
    // Documentos
    if (campo.includes('documentos') && Array.isArray(val)) {
      return val.map(d => d.originalName || d.url).join(', ');
    }
    // Objetos con nombre
    if (typeof val === 'object' && val?.nombre) {
      return val.nombre;
    }
    // Primitivos
    return String(val);
  };

  /* --------------------------------- UI -------------------------------------- */
  if (loading)
    return (
      <div className="p-6">
        <p className="text-gray-600">Cargando historial...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Historial de Cambios</h2>

      {historial.length === 0 ? (
        <p className="text-gray-500">No hay cambios registrados.</p>
      ) : (
        <div className="space-y-8">
          {historial.map(entry => (
            <div key={entry._id} className="flex items-start">
              {/* línea vertical de la cronología */}
              <div className="flex flex-col items-center">
                <span className="w-3 h-3 bg-blue-600 rounded-full mt-1" />
                <span className="flex-1 w-px bg-gray-300" />
              </div>

              <div className="ml-6 flex-grow">
                {/* encabezado de versión */}
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold">
                    Versión {entry.version} – {entry.action}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* detalle de cambios */}
                <div className="mt-4 space-y-2">
                  {entry.cambios.map((c, idx) => {
                    const Icon =
                      c.actionType === 'upload'
                        ? Upload
                        : c.actionType === 'download'
                        ? Download
                        : c.actionType === 'delete'
                        ? Trash2
                        : Edit2;

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-5 gap-4 text-sm rounded-lg p-2 hover:bg-gray-50"
                      >
                        {/* campo */}
                        <div className="col-span-1 flex items-center space-x-1">
                          <Icon size={16} className="text-blue-600" />
                          <span className="font-medium">
                            {c.campo.split(' > ').map((seg, i) => (
                              <Fragment key={i}>
                                {i > 0 && (
                                  <span className="text-gray-400 mx-0.5">›</span>
                                )}
                                {seg}
                              </Fragment>
                            ))}
                          </span>
                        </div>

                        {/* valor anterior */}
                        <div className="col-span-2 text-gray-700 break-all">
                          {renderValue(c.campo, c.valorAnterior)}
                        </div>

                        {/* valor nuevo */}
                        <div className="col-span-2 text-gray-700 break-all">
                          {renderValue(c.campo, c.valorNuevo)}
                        </div>

                        {/* pie: usuario y fecha */}
                        <div className="col-span-5 text-xs text-gray-400">
                          {c.usuario} | {new Date(c.fecha).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialCambios;
