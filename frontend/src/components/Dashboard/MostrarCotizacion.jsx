// src/components/Dashboard/MostrarCotizacion.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { Formik, Form } from 'formik';

import EncabezadoCotizacion from './NuevaCotizacion/EncabezadoCotizacion';
import ModalComentarios from './NuevaCotizacion/modals/ModalComentarios';

const MostrarCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [listaVendedores, setListaVendedores] = useState([]);
  const [listaPlantas, setListaPlantas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado para controlar el modal de comentarios
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await axiosInstance.get(`/cotizaciones/${id}`);
        const cot = res.data.cotizacion;

        // ----- Preparamos header igual que en EditCotizacion -----
        const clienteId = typeof cot.cliente === 'object' ? cot.cliente._id : cot.cliente;
        const vendedorId = typeof cot.vendedor === 'object' ? cot.vendedor._id : cot.vendedor;
        const plantaId = typeof cot.planta === 'object' ? cot.planta._id : cot.planta;

        const header = {
          cliente: clienteId || '',
          requisitor: cot.requisitor || '',
          vendedor: vendedorId || '',
          fechaInicio: new Date(cot.fechaInicio).toISOString().split('T')[0],
          planta: plantaId || '',
          serial: cot.serial || '',
          tiempoEntregaMin: cot.tiempoEntregaMin || '',
          tiempoEntregaMax: cot.tiempoEntregaMax || '',
        };

        // ----- Preparamos renglones en la misma forma que EditCotizacion -----
        const renglones = (cot.renglones || []).map(r => ({
          ...r,
          material: (r.material || []).map(m => ({
            ...m,
            cantidad: m.cantidad ?? 1
          })),
        }));

        // ----- Construimos una “lista” con el vendedor seleccionado -----
        // Así el <select> de EncabezadoCotizacion podrá mostrar el nombre:
        if (cot.vendedor && typeof cot.vendedor === 'object') {
          setListaVendedores([{
            _id: cot.vendedor._id,
            nombre: cot.vendedor.nombre
          }]);
        } else {
          setListaVendedores([]);
        }

        // ----- Lo mismo para la “lista” de plantas -----
        if (cot.planta && typeof cot.planta === 'object') {
          setListaPlantas([{
            _id: cot.planta._id,
            serial: cot.planta.serial,
            nombre: cot.planta.nombre
          }]);
        } else {
          setListaPlantas([]);
        }

        setInitialValues({ header, renglones });
      } catch (err) {
        console.error('Error al cargar cotización:', err);
        setError('No se pudo cargar la cotización.');
      } finally {
        setLoading(false);
      }
    };
    fetchCotizacion();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        Cargando cotización…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="min-h-screen p-4">
        Cotización no encontrada.
      </div>
    );
  }

  // Función para calcular costo de cada renglón
  const calcularCostoRenglon = (r) => {
    const costoMaterial = (r.material || []).reduce((sum, mat) => {
      const qty = mat.cantidad || 0;
      const price = mat.proveedorSeleccionado?.precioUnitario || 0;
      return sum + qty * price;
    }, 0);

    const costoTiempos = (r.tiempos || []).reduce(
      (sum, t) => sum + (t.horas || 0) * (t.costoHora || 0),
      0
    );

    const subtotal = (costoMaterial + costoTiempos) * (r.cantidad || 1);
    return subtotal * (1 + ((r.porcentaje || 0) / 100));
  };

  // Suma total de la cotización
  const sumaImportes = initialValues.renglones.reduce(
    (acc, r) => acc + calcularCostoRenglon(r),
    0
  );

  return (
    <div className="p-4 space-y-6">
      <div className="max-w-screen-xl mx-auto p-6 relative">
        <button
          onClick={() => navigate(`/dashboard/cotizacion/${id}`)}
          className="absolute top-6 right-6 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow"
        >
          Ver PDF
        </button>

        <h1 className="text-2xl font-bold mb-6">Vista de la Cotización</h1>

        <Formik
          initialValues={initialValues}
          onSubmit={() => {}}
          enableReinitialize
        >
          {({ values }) => (
            <Form>
              {/* ─── EncabezadoCotizacion en read-only ─── */}
              <EncabezadoCotizacion
                header={values.header}
                onChange={() => {}}
                vendedores={listaVendedores}  
                plantas={listaPlantas}        
                readOnly={true}              
              />

              {/* ─── Tabla de renglones en read-only ─── */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Renglones</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Cant</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Descripción</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Documentos</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Material</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Tiempos</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Días Hábs.</th>
                        <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">%</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Costo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"></th>
                        <th className="w-16 px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {values.renglones.map((r, idx) => (
                        <tr key={idx}>
                          {/* Cantidad */}
                          <td className="p-2 border text-center">
                            <span>{r.cantidad}</span>
                          </td>

                          {/* Descripción */}
                          <td className="p-2 border">
                            <span>{r.descripcion}</span>
                          </td>

                          {/* Documentos (miniaturas o enlaces) */}
                          <td className="p-2 border text-center">
                            {Array.isArray(r.documentos) &&
                              r.documentos.map((doc, i) => (
                                <div key={i} className="flex items-center justify-center mb-1 space-x-2">
                                  {/\.(jpe?g|png|gif)$/i.test(doc.url) ? (
                                    <img src={doc.url} alt={doc.originalName} className="h-10 mx-auto" />
                                  ) : (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 underline text-sm"
                                    >
                                      {doc.originalName}
                                    </a>
                                  )}
                                </div>
                              ))}
                          </td>

                          {/* Material */}
                          <td className="p-2 border text-center">
                            {Array.isArray(r.material) && r.material.map((mat, iMat) => (
                              <div key={iMat} className="text-sm mb-2">
                                <p className="font-medium">{mat.nombre}</p>
                                {mat.proveedorSeleccionado && (
                                  <p className="text-xs text-gray-600">
                                    Proveedor: {mat.proveedorSeleccionado.nombre}
                                  </p>
                                )}
                                {mat.unidadPresentacion && (
                                  <p className="text-xs text-gray-600">
                                    Presentación: {mat.unidadPresentacion.toLowerCase()}
                                  </p>
                                )}
                                <p className="text-xs">
                                  Cant.: {mat.cantidad} {mat.unidadMedida}
                                </p>
                              </div>
                            ))}
                          </td>

                          {/* Tiempos */}
                          <td className="p-2 border">
                            {Array.isArray(r.tiempos) && (
                              <div className="space-y-4">
                                {/* Producción */}
                                <section className="border border-green-300 bg-green-50 p-2 rounded">
                                  <h4 className="font-semibold text-green-700 mb-2">Producción</h4>
                                  {r.tiempos
                                    .filter(t => t.tipo === 'producción')
                                    .map((t, iT) => (
                                      <div key={iT} className="text-sm">
                                        {t.maquina}: {t.horas}h
                                      </div>
                                    ))}
                                </section>

                                {/* Diseño */}
                                <section className="border border-blue-300 bg-blue-50 p-2 rounded">
                                  <h4 className="font-semibold text-blue-700 mb-2">Diseño</h4>
                                  {r.tiempos
                                    .filter(t => t.tipo === 'diseño')
                                    .map((t, iT) => (
                                      <div key={iT} className="text-sm">
                                        {t.maquina}: {t.horas}h
                                      </div>
                                    ))}
                                </section>

                                {/* Trabajo Externo */}
                                <section className="border border-purple-300 bg-purple-50 p-2 rounded">
                                  <h4 className="font-semibold text-purple-700 mb-2">Trabajo Externo</h4>
                                  {r.tiempos
                                    .filter(t => t.tipo === 'externo')
                                    .map((t, iT) => (
                                      <div key={iT} className="text-sm">
                                        {t.maquina}: {t.horas}h
                                      </div>
                                    ))}
                                </section>
                              </div>
                            )}
                          </td>

                          {/* Días hábiles */}
                          <td className="p-2 border text-center">
                            {((r.tiempos || []).reduce((sum, t) => sum + (t.horas || 0), 0) / 8).toFixed(2)}
                          </td>

                          {/* Porcentaje */}
                          <td className="p-2 border text-center">
                            <span>{r.porcentaje}%</span>
                          </td>

                          {/* Costo */}
                          <td className="p-2 border text-right">
                            ${calcularCostoRenglon(r).toFixed(2)}
                          </td>

                          {/* Comentarios */}
                          <td className="p-2 border text-center">
                            <button
                              onClick={() => {
                                setCurrentComments(r.comentarios || []);
                                setCommentModalOpen(true);
                              }}
                              className="inline-flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900"
                            >
                              <span>💬</span>
                              <span>{(r.comentarios || []).length}</span>
                            </button>
                          </td>

                          {/* Eliminar (solo “—” en readonly) */}
                          <td className="p-2 border text-center">
                            <span>—</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── Total Cotización ─── */}
              <div className="bg-white p-4 rounded shadow flex justify-end items-center mb-6">
                <span className="mr-4 font-semibold">Total Cotización:</span>
                <span className="text-xl font-bold">${sumaImportes.toFixed(2)}</span>
              </div>

              {/* Botón “Volver al Dashboard” */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded"
                >
                  Volver al Dashboard
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {/* ─── Modal de comentarios ─── */}
      {commentModalOpen && (
        <ModalComentarios
          comentarios={currentComments}
          readOnly={true} 
          usuario={''}            // En modo read‐only, podemos dejarlo vacío o pasar un string genérico
          onClose={() => setCommentModalOpen(false)}
          onAgregarComentario={() => {}}
        />
      )}
    </div>
  );
};

export default MostrarCotizacion;