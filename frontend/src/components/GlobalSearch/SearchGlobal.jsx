import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const API_URL = import.meta.env.VITE_API_URL;

const SearchGlobal = () => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Carga inicial
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axiosInstance.get('/cotizaciones/search');
        setResultados(res.data.resultados);
      } catch (err) {
        setError(err.response?.data?.msg || 'Error cargando cotizaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // justo encima de tu componente...
  const buildImageSrc = (url) => {
    // si ya es http(s) absoluto
    if (/^https?:\/\//.test(url)) return url;
    // si es ruta relativa, asegúrate de poner un "/" entre medio
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Filtrado client-side
  const proyectosFiltrados = resultados.filter(cot => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      cot.cliente?.nombre?.toLowerCase().includes(q) ||
      cot.serial.toLowerCase().includes(q) ||
      cot.estado.toLowerCase().includes(q) ||
      cot.planta?.nombre?.toLowerCase().includes(q) ||
      cot.renglones.some(r => r.descripcion.toLowerCase().includes(q))
    );
  });

  // Extrae imágenes de los renglones filtrados
  const imagenes = proyectosFiltrados.flatMap(cot =>
    cot.renglones.flatMap(r =>
      (r.documentos || [])
        .filter(d => /\.(jpe?g|png|gif)$/i.test(d.url))
        .map(d => ({
          url: d.url,
          originalName: d.originalName,
          cotizacionId: cot._id
        }))
    )
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          Búsqueda Global de Proyectos
        </h2>
        <form
          onSubmit={e => e.preventDefault()}
          className="flex mb-8 space-x-4"
        >
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Buscar
          </button>
        </form>

        {loading && <p className="text-gray-600">Cargando resultados...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && proyectosFiltrados.length === 0 && !error && (
          <p className="text-gray-500">No se encontraron cotizaciones.</p>
        )}

        {proyectosFiltrados.length > 0 && (
          <div className="flex space-x-6">
            {/* Columna Izquierda: Listado de proyectos */}
            <div className="w-1/2 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
              {proyectosFiltrados.map(cot => (
                <div
                  key={cot._id}
                  className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div className="flex-grow space-y-1">
                      <p>
                        <span className="font-semibold">Cliente:</span>{' '}
                        {cot.cliente?.nombre}
                      </p>
                      <p>
                        <span className="font-semibold">Serial:</span>{' '}
                        {cot.serial}
                      </p>
                      <p>
                        <span className="font-semibold">Estado:</span>{' '}
                        {cot.estado}
                      </p>
                      <p>
                        <span className="font-semibold">Total:</span> $
                        {cot.total.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-semibold">Fecha Inicio:</span>{' '}
                        {new Date(cot.fechaInicio).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-semibold">Planta:</span>{' '}
                        {cot.planta?.nombre}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/cotizacion/${cot._id}`)
                      }
                      className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Ver Cotización
                    </button>
                  </div>

                  {/* Tabla de Renglones */}
                  <div className="overflow-x-auto mt-6">
                    <table className="min-w-full bg-white border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 border text-left">Cant</th>
                          <th className="p-2 border text-left">Descripción</th>
                          <th className="p-2 border text-left">Material</th>
                          <th className="p-2 border text-left">Tiempos</th>
                          <th className="p-2 border text-left">Días hábiles</th>
                          <th className="p-2 border text-left">%</th>
                          <th className="p-2 border text-right">Costo</th>
                          <th className="p-2 border text-left">Comentarios</th>
                          <th className="p-2 border text-left">Documentos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cot.renglones.map((r, i) => {
                          const diasHabiles =
                            (r.tiempos.reduce((sum, t) => sum + t.horas, 0) /
                              8
                            ).toFixed(2);
                          return (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-2 border">{r.cantidad}</td>
                              <td className="p-2 border">{r.descripcion}</td>
                              <td className="p-2 border">
                                {Array.isArray(r.material) &&
                                  r.material.map((m, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center mb-1 space-x-2"
                                    >
                                      {m.imagen && (
                                        <img
                                          src={`${API_URL}${m.imagen}`}
                                          alt={m.nombre}
                                          className="w-8 h-8 object-cover rounded"
                                        />
                                      )}
                                      <span className="text-sm">
                                        {m.nombre}
                                      </span>
                                      {m.proveedorSeleccionado && (
                                        <span className="text-xs text-gray-600">
                                          (${m.proveedorSeleccionado.precioUnitario})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                              </td>
                              <td className="p-2 border">
                                {Array.isArray(r.tiempos) &&
                                  r.tiempos.map((t, idx) => (
                                    <div key={idx} className="text-sm">
                                      {t.maquina}: {t.horas}h
                                    </div>
                                  ))}
                              </td>
                              <td className="p-2 border">{diasHabiles}</td>
                              <td className="p-2 border">{r.porcentaje}%</td>
                              <td className="p-2 border text-right">
                                ${((r.costo || 0).toFixed(2))}
                              </td>
                              <td className="p-2 border">
                                {r.comentarios.map((c, idx) => (
                                  <div key={idx} className="text-sm mb-1">
                                    “{c.texto}”
                                  </div>
                                ))}
                              </td>
                              <td className="p-2 border">
                                {r.documentos.map((d, idx) =>
                                  /\.(jpe?g|png|gif)$/i.test(d.url) ? (
                                    <img
                                      key={idx}
                                      src={`${API_URL}${d.url}`}
                                      alt=""
                                      className="h-8 inline-block mr-1"
                                    />
                                  ) : (
                                    <a
                                      key={idx}
                                      href={d.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 underline text-sm mr-2"
                                    >
                                      {d.originalName}
                                    </a>
                                  )
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Columna Derecha: Galería de Imágenes */}
            <div className="w-1/2 overflow-y-auto max-h-[calc(100vh-200px)] pl-2">
              <h3 className="text-xl font-semibold mb-4">Imágenes de Proyectos</h3>
              {imagenes.length === 0 ? (
                <p className="text-gray-500">No hay imágenes para mostrar.</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {imagenes.map((img, i) => (
                    <div
                      key={i}
                      className="cursor-pointer overflow-hidden rounded-lg shadow hover:scale-105 transform transition"
                      onClick={() =>
                        navigate(`/dashboard/cotizacion/${img.cotizacionId}`)
                      }
                    >
                      <img
                        src={buildImageSrc(img.url)}
                        alt={img.originalName}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGlobal;
