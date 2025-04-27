// src/components/Dashboard/CotizacionesTable.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CotizacionesTable = ({
  cotizaciones,
  userRole,            // 'vendedores' | 'administrador' | 'director' | 'jefe_de_produccion'
  onOpenModalAprobacion,
  onDuplicar,
  onVerCotizacion,
  onEliminarCotizacion,
  onComments,          // ← nuevo prop
}) => {
  const navigate = useNavigate();

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxDocs, setLightboxDocs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (docs, idx) => {
    // sólo imágenes
    const images = docs.filter(d => /\.(jpe?g|png|gif)$/i.test(d.url));
    if (images.length) {
      setLightboxDocs(images);
      setCurrentIndex(idx);
      setLightboxOpen(true);
    }
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prev = () => setCurrentIndex((i) => (i - 1 + lightboxDocs.length) % lightboxDocs.length);
  const next = () => setCurrentIndex((i) => (i + 1) % lightboxDocs.length);

  // Roles
  const isVendor = userRole === 'vendedores';
  const isAdmin = userRole === 'administrador';
  const isDirector = userRole === 'director';
  const isDisenador = userRole === 'disenador';
  const isJefeProd = userRole === 'jefe de produccion';

  const canApprove = isAdmin || isDirector;
  const canEdit = isVendor || isAdmin || isDirector || isDisenador || isJefeProd;
  const canDelete = isVendor || isAdmin || isDirector;
  const canDuplicate = isVendor || isAdmin || isDisenador || isDirector;

  return (
    <>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>{canApprove
            ? <><th className="p-2 border">Cliente</th><th className="p-2 border">Fecha</th><th className="p-2 border">Planta</th><th className="p-2 border">Serial</th><th className="p-2 border">Docs</th><th className="p-2 border">Total</th><th className="p-2 border w-16 text-center">Estado</th><th className="p-2 border">A/R</th><th className="p-2 border">💬</th><th className="p-2 border">Acciones</th></>
            : <><th className="p-2 border">Cliente</th><th className="p-2 border">Fecha</th><th className="p-2 border">Planta</th><th className="p-2 border">Serial</th><th className="p-2 border">Docs</th><th className="p-2 border">Total</th><th className="p-2 border w-16 text-center">Estado</th><th className="p-2 border">💬</th><th className="p-2 border">Acciones</th></>
          }
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map(cot => {

            const count = cot.comentarios?.length || 0;
            // aplanamos todos los docs
            const docs = cot.renglones
              .flatMap(r => r.documentos || [])
              .filter(d => d.url);

            return (
              <tr key={cot._id}>
                <td className="p-2 border">{cot.cliente?.nombre || '—'}</td>
                <td className="p-2 border">{new Date(cot.fechaInicio).toLocaleDateString()}</td>
                <td className="p-2 border">{cot.planta?.nombre || '—'}</td>
                <td className="p-2 border">{cot.serial}</td>

                {/* Docs column */}
                <td className="p-2 border">
                  {docs.length === 0
                    ? <span className="text-gray-400">—</span>
                    : (
                      <div className="flex items-center space-x-1">
                        {docs.slice(0, 2).map((doc, i) => (
                          /\.(jpe?g|png|gif)$/i.test(doc.url) ? (
                            <img
                              key={i}
                              src={doc.url}
                              alt={doc.originalName}
                              className="h-8 w-8 object-cover rounded border cursor-pointer"
                              title={doc.originalName}
                              onClick={() => openLightbox(docs, i)}
                            />
                          ) : (
                            <a
                              key={i}
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline text-xs"
                              title={doc.originalName}
                            >
                              📄
                            </a>
                          )
                        ))}
                        {docs.length > 2 && (
                          <span className="text-xs text-gray-600">+{docs.length - 2}</span>
                        )}
                      </div>
                    )
                  }
                </td>

                <td className="p-2 border">${cot.total.toFixed(2)}</td>

                {/* Estado reducido */}
                <td className="p-2 border w-16 text-center" title={cot.estado}>
                  {{
                    'Pendiente de aprobación': '🟡',
                    'Aprobado': '🟢',
                    'Rechazado': '🔴'
                  }[cot.estado] || '—'}
                </td>

                {canApprove && (
                  <td className="p-2 border text-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => onOpenModalAprobacion({
                        cotizacionId: cot._id,
                        currentState: cot.estado,
                        action: 'approve'
                      })}
                    >
                      A/R
                    </button>
                  </td>
                )}

                {/* Comentarios */}
                <td className="p-2 border text-center">
                  <button
                    className="inline-flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => onComments(cot._id)}
                    title="Ver / agregar comentarios"
                  >
                    <span>💬</span>
                    <span>{count}</span>
                  </button>
                </td>

                <td className="p-2 border text-center space-x-1">
                  <button
                    className="bg-cyan-500 text-white px-2 py-1 rounded"
                    onClick={() => onVerCotizacion(cot._id)}
                  >
                    Ver
                  </button>
                  {canEdit && (
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => onOpenModalAprobacion({
                        cotizacionId: cot._id,
                        currentState: cot.estado,
                        action: 'edit'
                      })}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => navigate(`/dashboard/cotizacion/${cot._id}/historial`)}
                  >
                    Hist
                  </button>
                  {canDuplicate && (
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => onDuplicar(cot._id)}
                    >
                      Dup
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => onEliminarCotizacion(cot._id)}
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={closeLightbox}
            >×</button>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-3xl"
              onClick={prev}
            >‹</button>
            <img
              src={lightboxDocs[currentIndex].url}
              alt={lightboxDocs[currentIndex].originalName}
              className="max-h-[90vh] mx-auto rounded"
            />
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-3xl"
              onClick={next}
            >›</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CotizacionesTable;
