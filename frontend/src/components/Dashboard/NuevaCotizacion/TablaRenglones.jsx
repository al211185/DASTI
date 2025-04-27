// src/components/Dashboard/NuevaCotizacion/TablaRenglones.jsx
import React, { useContext } from 'react';
import { Field, ErrorMessage, FieldArray } from 'formik';
import { UserContext } from '../../../context/UserContext';
const API_URL = import.meta.env.VITE_API_URL;

const TablaRenglones = ({
  renglones,
  values,
  setFieldValue,
  setModalMaterialesIndex,
  setModalTiemposIndex,
  setModalProveedores,
  setModalComentariosIndex,
  setModalDocumentosIndex,
  calcularCostoRenglon,
}) => {
  const { user } = useContext(UserContext);
  const role = user?.rol?.nombre?.toLowerCase();
  const isVendedor = role === 'vendedores';
  const isDisenador = role === 'disenador';
  const isJefe = role === 'jefe de produccion';

  return (
    <FieldArray name="renglones">
      {({ push, remove }) => (
        <div className="bg-white p-4 rounded shadow mb-6">
          {/* sólo no muestran agregar renglón los jefes */}
          {!isJefe && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Renglones</h2>
              <button
                type="button"
                onClick={() =>
                  push({
                    cantidad: 1,
                    descripcion: '',
                    documentos: [],
                    material: [{
                      _id: '',
                      nombre: '',
                      unidadMedida: '',
                      proveedorSeleccionado: null,
                      cantidad: 1,
                      precio: 0
                    }],
                    tiempos: [],
                    porcentaje: 0,
                    costo: 0,
                    comentarios: [],
                  })
                }
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Agregar renglón
              </button>
            </div>
          )}

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Cant</th>
                <th className="p-2 border">Descripción</th>
                <th className="p-2 border">Documentos</th>
                <th className="p-2 border">Material</th>
                <th className="p-2 border">Tiempos</th>
                <th className="p-2 border">Días Hábs.</th>
                <th className="p-2 border">%</th>
                <th className="p-2 border">Costo</th>
                <th className="p-2 border">Comentarios</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renglones.map((r, idx) => (
                <tr key={idx}>
                  {/* Cantidad */}
                  <td className="p-2 border">
                    {isJefe
                      ? <span>{r.cantidad}</span>
                      : <Field
                          name={`renglones.${idx}.cantidad`}
                          type="number"
                          className="w-full border rounded p-1"
                        />
                    }
                    {!isJefe && (
                      <ErrorMessage
                        name={`renglones.${idx}.cantidad`}
                        component="div"
                        className="text-red-500 text-xs"
                      />
                    )}
                  </td>

                  {/* Descripción */}
                  <td className="p-2 border">
                    {isJefe
                      ? <span>{r.descripcion}</span>
                      : <Field
                          name={`renglones.${idx}.descripcion`}
                          type="text"
                          className="w-full border rounded p-1"
                        />
                    }
                    {!isJefe && (
                      <ErrorMessage
                        name={`renglones.${idx}.descripcion`}
                        component="div"
                        className="text-red-500 text-xs"
                      />
                    )}
                  </td>

                  {/* Documentos (todos pueden) */}
                  <td className="p-2 border text-center">
                    {r.documentos.map((doc, i) => (
                      <div key={i} className="flex items-center justify-center mb-1 space-x-2">
                        {/\.(jpe?g|png|gif)$/i.test(doc.url) ? (
                          <img src={doc.url} alt={doc.originalName} className="h-10" />
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
                        <button
                          type="button"
                          className="text-red-500 font-bold"
                          onClick={() => {
                            const docs = [...values.renglones[idx].documentos];
                            docs.splice(i, 1);
                            setFieldValue(`renglones.${idx}.documentos`, docs);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="mt-2 bg-gray-200 px-2 py-1 rounded text-sm"
                      onClick={() => setModalDocumentosIndex(idx)}
                    >
                      {r.documentos.length ? 'Agregar más' : 'Subir documentos'}
                    </button>
                  </td>

                  {/* Material */}
                  <td className="p-2 border align-top">
                    {isJefe
                      ? r.material.map((m, i) => (
                          <div key={i} className="text-sm mb-1">
                            {m.nombre} ({m.cantidad} {m.unidadMedida})
                          </div>
                        ))
                      : (
                        <>
                          {r.material.map((mat, iMat) => (
                            <div key={iMat} className="border p-2 rounded space-y-2">
                              <div className="flex items-center space-x-2">
                                {mat.imagen && (
                                  <img
                                    src={`${API_URL}${mat.imagen}`}
                                    alt={mat.nombre}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{mat.nombre}</p>
                                  {mat.proveedorSeleccionado && (
                                    <p className="text-xs text-gray-600">
                                      Proveedor: {mat.proveedorSeleccionado.nombre}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="text-red-500 font-bold"
                                  onClick={() => {
                                    const copia = [...values.renglones[idx].material];
                                    copia.splice(iMat, 1);
                                    setFieldValue(`renglones.${idx}.material`, copia);
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                <label className="text-sm">Cant.:</label>
                                <Field
                                  name={`renglones.${idx}.material.${iMat}.cantidad`}
                                  type="number"
                                  min="0"
                                  className="w-16 border rounded p-1"
                                />
                                <span className="text-sm">{mat.unidadMedida}</span>
                                <ErrorMessage
                                  name={`renglones.${idx}.material.${iMat}.cantidad`}
                                  component="div"
                                  className="text-red-500 text-xs"
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="mt-2 bg-gray-200 px-2 py-1 rounded w-full text-sm"
                            onClick={() => setModalMaterialesIndex(idx)}
                          >
                            {r.material.length ? 'Agregar otro material' : 'Agregar material'}
                          </button>
                        </>
                      )
                    }
                  </td>

                  {/* Tiempos */}
                  <td className="p-2 border">
                    { /* vendedor solo ve lectura, otros roles editan */ }
                    {isVendedor && !isDisenador
                      ? r.tiempos.map((t, iT) => (
                          <div key={iT} className="text-sm mb-1">
                            {t.maquina}: {t.horas}h
                          </div>
                        ))
                      : (
                        <div className="space-y-4">
                          {/* Producción */}
                          <section className="border border-green-300 bg-green-50 p-2 rounded">
                            <h4 className="font-semibold text-green-700 mb-2">Producción</h4>
                            {r.tiempos
                              .filter(t => t.tipo === 'producción')
                              .map((t, iT) => (
                                <div key={iT} className="flex justify-between items-center mb-1">
                                  <span className="text-sm">{t.maquina}: {t.horas}h</span>
                                  <button
                                    type="button"
                                    className="text-red-500 text-xs"
                                    onClick={() => {
                                      const n = [...values.renglones];
                                      n[idx].tiempos = n[idx].tiempos.filter((_, k) => k !== iT);
                                      setFieldValue('renglones', n);
                                    }}
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                            <button
                              type="button"
                              className="mt-2 bg-green-300 px-2 py-1 rounded text-green-800 text-sm"
                              onClick={() => setModalTiemposIndex({ index: idx, tipo: 'producción' })}
                            >
                              + Máquina de Producción
                            </button>
                          </section>
                          {/* Diseño */}
                          <section className="border border-blue-300 bg-blue-50 p-2 rounded">
                            <h4 className="font-semibold text-blue-700 mb-2">Diseño</h4>
                            {r.tiempos
                              .filter(t => t.tipo === 'diseño')
                              .map((t, iT) => (
                                <div key={iT} className="flex justify-between items-center mb-1">
                                  <span className="text-sm">{t.maquina}: {t.horas}h</span>
                                  <button
                                    type="button"
                                    className="text-red-500 text-xs"
                                    onClick={() => {
                                      const n = [...values.renglones];
                                      n[idx].tiempos = n[idx].tiempos.filter((_, k) => k !== iT);
                                      setFieldValue('renglones', n);
                                    }}
                                  >
                                    X
                                  </button>
                                </div>
                              ))}
                            <button
                              type="button"
                              className="mt-2 bg-blue-300 px-2 py-1 rounded text-blue-800 text-sm"
                              onClick={() => setModalTiemposIndex({ index: idx, tipo: 'diseño' })}
                            >
                              + Máquina de Diseño
                            </button>
                          </section>
                        </div>
                      )
                    }
                  </td>

                  {/* Días hábiles */}
                  <td className="p-2 border text-center">
                    {(r.tiempos.reduce((sum, t) => sum + t.horas, 0) / 8).toFixed(2)}
                  </td>

                  {/* Porcentaje */}
                  <td className="p-2 border">
                    {isJefe
                      ? <span>—</span>
                      : (isVendedor || isDisenador)
                        ? <span>{r.porcentaje}%</span>
                        : (
                          <>
                            <Field
                              name={`renglones.${idx}.porcentaje`}
                              type="number"
                              className="w-full border rounded p-1"
                            />
                            <ErrorMessage
                              name={`renglones.${idx}.porcentaje`}
                              component="div"
                              className="text-red-500 text-xs"
                            />
                          </>
                        )
                    }
                  </td>

                  {/* Costo */}
                  <td className="p-2 border text-right">
                    {isJefe
                      ? <span>—</span>
                      : `$${calcularCostoRenglon(r).toFixed(2)}`
                    }
                  </td>

                  {/* Comentarios */}
                  <td className="p-2 border text-center">
                    <button
                      type="button"
                      className="bg-gray-200 px-2 py-1 rounded text-sm"
                      onClick={() => setModalComentariosIndex(idx)}
                    >
                      {r.comentarios.length} Coment.
                    </button>
                  </td>

                  {/* Eliminar renglón */}
                  <td className="p-2 border text-center">
                    {!isJefe && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FieldArray>
  );
};

export default TablaRenglones;
