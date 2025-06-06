// src/components/Dashboard/SearchGlobal.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { UserContext } from '../../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL;

const SearchGlobal = () => {
  const { user } = useContext(UserContext);
  const role = user?.rol?.nombre?.toLowerCase();
  const isDirector = role === 'director';
  const isAdmin = role === 'administrador';
  const canViewFinancial = isDirector || isAdmin;

  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Guarda el _id de la cotización seleccionada (para scroll y filtrado de imágenes)
  const [selectedCotizacionId, setSelectedCotizacionId] = useState(null);

  const navigate = useNavigate();

  // 1) Refs dinámicos para cada tarjeta de cotización en la columna izquierda
  const cotRefs = useRef({});

  // 2) Carga inicial de cotizaciones
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

  // 3) URL absoluta para las imágenes
  const buildImageSrc = (url) => {
    if (/^https?:\/\//.test(url)) return url;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 4) Filtrado client-side según el query
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

  // 5) Extraemos TODAS las imágenes de los proyectos filtrados
  const todasImagenes = proyectosFiltrados.flatMap(cot =>
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

  // 6) Separamos imágenes de la cotización seleccionada / resto de imágenes
  const imagenesSeleccionadas = selectedCotizacionId
    ? todasImagenes.filter(img => img.cotizacionId === selectedCotizacionId)
    : [];
  const imagenesRestantes = selectedCotizacionId
    ? todasImagenes.filter(img => img.cotizacionId !== selectedCotizacionId)
    : todasImagenes;

  // 7) Siempre mostramos TODAS las cotizaciones filtradas,
  //    sólo usamos selectedCotizacionId para resaltar y desplazarnos.
  const cotizacionesMostradas = proyectosFiltrados;

  const imagesContainerRef = useRef(null)

  // 8) Cuando cambia selectedCotizacionId, hacemos scroll a la tarjeta correspondiente
  useEffect(() => {
    if (selectedCotizacionId && cotRefs.current[selectedCotizacionId]) {
      cotRefs.current[selectedCotizacionId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  if (imagesContainerRef.current) {
      imagesContainerRef.current.scrollTop = 0;
    }
  }, [selectedCotizacionId]);

  return (
    <div className="h-screen py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Búsqueda Global de Proyectos
        </h1>

        <form
          onSubmit={e => e.preventDefault()}
          className="flex mb-8 gap-4"
        >
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              // Si cambiamos el texto de búsqueda, deseleccionamos 
              // la cotización previamente seleccionada
              setSelectedCotizacionId(null);
            }}
            className="w-full h-12 bg-gray-200 placeholder-gray-600 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-primary transition"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg"
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
            {/* ------------------------------------------------------- */}
            {/* Columna Izquierda: Listado de cotizaciones             */}
            {/* ------------------------------------------------------- */}
            <div className="w-1/2 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
              {cotizacionesMostradas.map(cot => (
                <div
                  key={cot._id}
                  // Referencia al DOM para hacer scrollIntoView luego
                  ref={el => { cotRefs.current[cot._id] = el; }}
                  // Al clicar en cualquier parte de la tarjeta, seleccionamos esa cotización
                  onClick={() => setSelectedCotizacionId(cot._id)}
                  // Resaltamos si coincide con `selectedCotizacionId`
                  className={`
                    cursor-pointer
                    bg-white rounded-lg shadow-md p-6 mb-6 transition
                    ${cot._id === selectedCotizacionId
                      ? 'border-2 border-primary bg-primary/5'
                      : 'border'}
                  `}
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
                      onClick={e => {
                        // Evitamos que el botón dispare el onClick padre
                        e.stopPropagation();
                        navigate(`/dashboard/cotizacion/${cot._id}`);
                      }}
                      className="mt-4 sm:mt-0 bg-secondary hover:bg-secondary-dark text-white px-4 py-1 leading-tight rounded-lg"
                    >
                      Ver Cotización
                    </button>
                  </div>

                  {/* Tabla de Renglones */}
                  <div className="overflow-x-auto mt-6 shadow rounded-lg">
                    <table className="table-auto min-w-max bg-white divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="min-w-[60px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            Cant
                          </th>
                          <th className="min-w-[150px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            Descripción
                          </th>
                          <th className="min-w-[200px] py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            Material
                          </th>
                          {canViewFinancial && (
                            <>
                              <th className="min-w-[200px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                Tiempos
                              </th>
                              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                Días hábiles
                              </th>
                              <th className="min-w-[80px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                %
                              </th>
                              <th className="min-w-[100px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                Costo
                              </th>
                            </>
                          )}
                          <th className="min-w-[80px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            Comentarios
                          </th>
                          <th className="min-w-[120px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                            Documentos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cot.renglones.map((r, i) => {
                          const diasHabiles = (
                            r.tiempos.reduce((sum, t) => sum + t.horas, 0) / 8
                          ).toFixed(2);
                          return (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
                                {r.cantidad}
                              </td>
                              <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
                                {r.descripcion}
                              </td>
                              <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
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
                              {canViewFinancial && (
                                <>
                                  <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
                                    {Array.isArray(r.tiempos) &&
                                      r.tiempos.map((t, idx) => (
                                        <div key={idx} className="text-sm">
                                          {t.maquina}: {t.horas}h
                                        </div>
                                      ))}
                                  </td>
                                  <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
                                    {diasHabiles}
                                  </td>
                                  <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
                                    {r.porcentaje}%
                                  </td>
                                  <td className="px-4 py-2 whitespace-normal break-words text-sm text-gray-700 border">
                                    ${(r.costo || 0).toFixed(2)}
                                  </td>
                                </>
                              )}
                              <td className="p-2 border">
                                {r.comentarios.map((c, idx) => (
                                  <div key={idx} className="text-sm mb-1">
                                    “{c.texto}”
                                  </div>
                                ))}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 border">
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

            {/* Columna Derecha: Galería de Imágenes                     */}
            <div ref={imagesContainerRef} className="w-1/2 overflow-y-auto max-h-[calc(100vh-200px)] pl-4">
              {/* 1) Si hay imágenes de la cotización seleccionada, las mostramos primero */}
              {selectedCotizacionId && imagenesSeleccionadas.length > 0 && (
                <>
                  <h4 className="text-lg font-medium mb-2">
                    Cotización seleccionada
                  </h4>
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {imagenesSeleccionadas.map((img, i) => (
                      <div
                        key={i}
                        className="cursor-pointer overflow-hidden rounded-lg shadow"
                        onClick={() => {
                          // Volver a “seleccionar” la misma cotización 
                          // (no cambia nada, pero mantiene el scroll si hiciera falta)
                          setSelectedCotizacionId(img.cotizacionId);
                        }}
                      >
                        <img
                          src={buildImageSrc(img.url)}
                          alt={img.originalName}
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Si hay cotización seleccionada y existen imágenes restantes, muestro la línea + título */}
                {selectedCotizacionId !== null && imagenesRestantes.length > 0 && (
                  <>
                    <div className="border-t-4 border-[#f7941e] my-4"></div>
                    <h4 className="text-lg font-medium mb-2">
                      Otras imágenes
                    </h4>
                  </>
                )}

                {/* Siempre renderizo las miniaturas de “otras imágenes” (aunque selectedCotizacionId sea null) */}
                {imagenesRestantes.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {imagenesRestantes.map((img, i) => (
                      <div
                        key={i}
                        className="cursor-pointer overflow-hidden rounded-lg shadow"
                        onClick={() => {
                          setSelectedCotizacionId(img.cotizacionId);
                        }}
                      >
                        <img
                          src={buildImageSrc(img.url)}
                          alt={img.originalName}
                          className="w-full h-56 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                            
              {/* 3) Si no hay NINGUNA imagen en ambos grupos, muestro un mensaje */}
              {selectedCotizacionId === null && todasImagenes.length === 0 && (
                <p className="text-gray-500">No hay imágenes para mostrar.</p>
              )}
              {selectedCotizacionId !== null &&
                imagenesSeleccionadas.length === 0 &&
                imagenesRestantes.length === 0 && (
                  <p className="text-gray-500">Esta cotización no tiene imágenes, y no hay más imágenes en otros proyectos.</p>
                )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchGlobal;
