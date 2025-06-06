// src/components/Dashboard/CotizacionesTable.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CotizacionesTable = ({
  cotizaciones,
  userRole,            // 'vendedores' | 'administrador' | 'director' | 'jefe_de_produccion'
  onOpenModalAprobacion,
  onDuplicar,
  onEliminarCotizacion,
  onComments,          // ← nuevo prop
}) => {
  const navigate = useNavigate();

  // ─── State para el Lightbox ───
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxDocs, setLightboxDocs] = useState([]);   // array con imágenes y PDFs para la galería
  const [currentIndex, setCurrentIndex] = useState(0);    // índice dentro de lightboxDocs

  /**
   * openLightbox:
   *  - docs: array completo de documentos de esta fila (imágenes, PDFs, Word, etc.)
   *  - docClicado: el objeto concreto sobre el que hicieron clic (doc.url + doc.originalName, etc.)
   *
   * Filtramos solo los elementos que queremos mostrar en la galería (imágenes + PDFs).
   * Luego hallamos la posición dentro de ese array filtrado para abrir en el índice correcto.
   */
  const openLightbox = (docs, docClicado) => {
    // 1) Filtramos en qué casos queremos mostrar un "lightbox":
    //    aquí incluimos tanto imágenes (*.jpg, *.png, *.gif) como PDF (*.pdf).
    const lightboxItems = docs.filter(d =>
      /\.(jpe?g|png|gif|pdf)$/i.test(d.url)
    );

    // 2) Buscamos la posición exacta de docClicado dentro de lightboxItems
    const idxEnGaleria = lightboxItems.findIndex(
      item => item.url === docClicado.url
    );

    if (idxEnGaleria >= 0) {
      setLightboxDocs(lightboxItems);
      setCurrentIndex(idxEnGaleria);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => setLightboxOpen(false);
  const prev = () => {
    setCurrentIndex(i => (i - 1 + lightboxDocs.length) % lightboxDocs.length);
  };
  const next = () => {
    setCurrentIndex(i => (i + 1) % lightboxDocs.length);
  };

  // ─── Roles y permisos ───
  const isVendor    = userRole === 'vendedores';
  const isAdmin     = userRole === 'administrador';
  const isDirector  = userRole === 'director';
  const isDisenador = userRole === 'disenador';
  const isJefeProd  = userRole === 'jefe de produccion';

  const canApprove   = isAdmin || isDirector;
  const canEdit      = isVendor || isAdmin || isDirector || isDisenador || isJefeProd;
  const canDelete    = isVendor || isAdmin || isDirector;
  const canDuplicate = isVendor || isAdmin || isDisenador || isDirector;

  return (
    <>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            {canApprove ? (
              <>
                <th className="p-2 border">Cliente</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Planta</th>
                <th className="p-2 border">Serial</th>
                <th className="p-2 border">Docs</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border w-16 text-center">Estado</th>
                <th className="p-2 border">A/R</th>
                <th className="p-2 border">💬</th>
                <th className="p-2 border">Acciones</th>
              </>
            ) : (
              <>
                <th className="p-2 border">Cliente</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Planta</th>
                <th className="p-2 border">Serial</th>
                <th className="p-2 border">Docs</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border w-16 text-center">Estado</th>
                <th className="p-2 border">💬</th>
                <th className="p-2 border">Acciones</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {cotizaciones.map(cot => {
            const count = cot.comentarios?.length || 0;

            // Aplanamos todos los "documentos" (renglones[].documentos)
            const docs = cot.renglones
              .flatMap(r => r.documentos || [])
              .filter(d => d.url); // solo aquellos que tengan URL

            return (
              <tr key={cot._id}>
                <td className="p-2 border">{cot.cliente?.nombre || '—'}</td>
                <td className="p-2 border">{new Date(cot.fechaInicio).toLocaleDateString()}</td>
                <td className="p-2 border">{cot.planta?.nombre || '—'}</td>
                <td className="p-2 border">{cot.serial}</td>

                {/* ─── Columna “Docs” ─── */}
                <td className="p-2 border">
  {docs.length === 0 ? (
    <span className="text-gray-400">—</span>
  ) : (
    <div className="flex items-center space-x-1 overflow-x-auto w-60">
      {docs.map((doc, i) => {
        // 1) Si es imagen (jpg/png/gif), mostramos <img> con onClick
        if (/\.(jpe?g|png|gif)$/i.test(doc.url)) {
          return (
            <img
              key={i}
              src={doc.url}
              alt={doc.originalName}
              className="h-32 w-32 object-cover rounded border cursor-pointer flex-shrink-0"
              title={doc.originalName}
              onClick={() => openLightbox(docs, doc)}
            />
          );
        }

        // 2) Si es PDF, envolvemos el <object> en un <div> con onClick.
        //    Para que el clic en el PDF “pase” al div padre, le ponemos
        //    pointer-events-none al <object>.
        if (/\.pdf$/i.test(doc.url)) {
          return (
            <div
              key={i}
              className="relative h-32 w-32 border cursor-pointer flex-shrink-0"
              onClick={() => openLightbox(docs, doc)}
              title={doc.originalName}
            >
              <object
                data={doc.url}
                type="application/pdf"
                className="h-full w-full pointer-events-none"
              >
                {/* Fallback si el navegador no rinde <object> */}
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 underline absolute inset-0 flex items-center justify-center"
                >
                  Ver PDF
                </a>
              </object>
            </div>
          );
        }

        // 3) Cualquier otro tipo de archivo (Word, Excel, etc.)
        return (
          <a
            key={i}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline text-xs flex-shrink-0"
            title={doc.originalName}
          >
            📄
          </a>
        );
      })}
    </div>
  )}
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

                {/* Acciones (select) */}
                <td className="p-2 border text-center">
                  <select
                    defaultValue=""
                    onChange={e => {
                      const action = e.target.value;
                      e.target.value = '';
                      switch (action) {
                        case 'view':
                          navigate(`/dashboard/mostrar-cotizacion/${cot._id}`);
                          break;
                        case 'edit':
                          onOpenModalAprobacion({
                            cotizacionId: cot._id,
                            currentState: cot.estado,
                            action: 'edit',
                          });
                          break;
                        case 'hist':
                          navigate(`/dashboard/cotizacion/${cot._id}/historial`);
                          break;
                        case 'dup':
                          onDuplicar(cot._id);
                          break;
                        case 'comments':
                          onComments(cot._id);
                          break;
                        case 'delete':
                          onEliminarCotizacion(cot._id);
                          break;
                        default:
                      }
                    }}
                    className="bg-gray-100 text-gray-700 rounded px-2 py-1 focus:outline-none"
                  >
                    <option value="" disabled>Acciones…</option>
                    <option value="view">Ver</option>
                    {canEdit && <option value="edit">Editar</option>}
                    <option value="hist">Hist</option>
                    {canDuplicate && <option value="dup">Dup</option>}
                    {canDelete && <option value="delete">Eliminar</option>}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ─── Modal Lightbox ─── */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-[90vw] max-h-[90vh]">
            {/* Botón cerrar (X) */}
            <button
              className="absolute top-2 right-2 text-white text-2xl"
              onClick={closeLightbox}
            >×</button>

            {/* Flecha izquierda */}
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-3xl"
              onClick={prev}
            >‹</button>

            {/* ─── Aquí elegimos si mostrar <img> o <object> ─── */}
            {/\.(jpe?g|png|gif)$/i.test(lightboxDocs[currentIndex].url) ? (
              <img
                src={lightboxDocs[currentIndex].url}
                alt={lightboxDocs[currentIndex].originalName}
                className="max-h-[90vh] mx-auto rounded"
              />
            ) : (
              <object
                data={lightboxDocs[currentIndex].url}
                type="application/pdf"
                className="w-full h-[90vh] mx-auto"
                style={{ maxWidth: '90vw' }}
                title={lightboxDocs[currentIndex].originalName}
              >
                {/* Fallback en caso de que <object> no se muestre */}
                <div className="text-white p-4">
                  <p>No se puede visualizar el PDF en el navegador.</p>
                  <a
                    href={lightboxDocs[currentIndex].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-200"
                  >
                    Abrir PDF en nueva pestaña
                  </a>
                </div>
              </object>
            )}

            {/* Flecha derecha */}
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
