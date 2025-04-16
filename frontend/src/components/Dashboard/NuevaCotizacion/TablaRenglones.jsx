// src/components/Dashboard/NuevaCotizacion/TablaRenglones.jsx
import React from 'react';
import { Field, ErrorMessage, FieldArray } from 'formik';
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
  return (
    <FieldArray name="renglones">
      {({ push, remove }) => (
        <div className="bg-white p-4 rounded shadow mb-6">
          {/* encabezado + botón agregar renglón */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Renglones</h2>
            <button
              type="button"
              onClick={() =>
                push({
                  cantidad: 1,
                  descripcion: '',
                  documentos: [],
                  material: [],
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

          {/* tabla */}
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Cant</th>
                <th className="p-2 border">Descripción</th>
                <th className="p-2 border">Documentos</th>
                <th className="p-2 border">Material</th>
                <th className="p-2 border">Tiempos</th>
                <th className="p-2 border">Días Hábiles</th>
                <th className="p-2 border">%</th>
                <th className="p-2 border">Costo</th>
                <th className="p-2 border">Comentarios</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {renglones.map((r, index) => (
                <tr key={index}>
                  {/* ------ cantidad ------ */}
                  <td className="p-2 border">
                    <Field
                      name={`renglones.${index}.cantidad`}
                      type="number"
                      className="w-full border rounded p-1"
                    />
                    <ErrorMessage
                      name={`renglones.${index}.cantidad`}
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </td>

                  {/* ------ descripción ------ */}
                  <td className="p-2 border">
                    <Field
                      name={`renglones.${index}.descripcion`}
                      type="text"
                      className="w-full border rounded p-1"
                    />
                    <ErrorMessage
                      name={`renglones.${index}.descripcion`}
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </td>

                  {/* ------ documentos ------ */}
                  <td className="p-2 border text-center">
                    {r.documentos.length ? (
                      <>
                        {r.documentos.map((doc, i) => (
                          <div key={i} className="mb-1">
                            {doc.url.match(/\.(jpe?g|png|gif)$/i) ? (
                              <img
                                src={doc.url}
                                alt={doc.originalName}
                                className="h-10 inline-block"
                              />
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
                        <button
                          type="button"
                          className="bg-gray-200 px-2 py-1 rounded mt-2"
                          onClick={() => setModalDocumentosIndex(index)}
                        >
                          Editar Documentos
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="bg-gray-200 px-2 py-1 rounded"
                        onClick={() => setModalDocumentosIndex(index)}
                      >
                        Subir Documentos
                      </button>
                    )}
                  </td>

                  {/* ------ material (N → N) ------ */}
                  <td className="p-2 border align-top">
                    {r.material.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {r.material.map((mat, iMat) => (
                          <div key={iMat} className="flex items-center space-x-2">
                            {mat.imagen && (
                              <img
                                src={`${API_URL}${mat.imagen}`}
                                alt={mat.nombre}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">{mat.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {mat.categoria?.nombre}
                              </p>
                              {mat.proveedorSeleccionado && (
                                <p className="text-xs text-gray-600">
                                  $
                                  {mat.proveedorSeleccionado.precioUnitario.toFixed(
                                    2
                                  )}
                                  /{mat.unidadMedida}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => {
                                const nuevos = [...values.renglones];
                                nuevos[index].material = nuevos[index].material.filter(
                                  (_, k) => k !== iMat
                                );
                                setFieldValue('renglones', nuevos);
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 👉 siempre visible para permitir agregar más */}
                    <button
                      type="button"
                      className="bg-gray-200 px-2 py-1 rounded w-full"
                      onClick={() => setModalMaterialesIndex(index)}
                    >
                      {r.material.length ? 'Agregar otro material' : 'Agregar material'}
                    </button>
                  </td>

                  {/* ------ tiempos ------ */}
                  <td className="p-2 border text-center">
                    {r.tiempos.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {r.tiempos.map((t, iT) => (
                          <div key={iT} className="flex items-center space-x-1">
                            <span className="text-sm">
                              {t.maquina} ({t.horas} h)
                            </span>
                            <button
                              type="button"
                              className="text-red-500 text-xs"
                              onClick={() => {
                                const n = [...values.renglones];
                                n[index].tiempos = n[index].tiempos.filter(
                                  (_, k) => k !== iT
                                );
                                setFieldValue('renglones', n);
                              }}
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className="bg-gray-200 px-2 py-1 rounded"
                      onClick={() => setModalTiemposIndex(index)}
                    >
                      Agregar máquina
                    </button>
                  </td>

                  {/* días hábiles */}
                  <td className="p-2 border text-center">
                    {r.tiempos.length
                      ? (
                          r.tiempos.reduce((tot, t) => tot + t.horas, 0) / 8
                        ).toFixed(2)
                      : '0'}
                  </td>

                  {/* porcentaje */}
                  <td className="p-2 border">
                    <Field
                      name={`renglones.${index}.porcentaje`}
                      type="number"
                      className="w-full border rounded p-1"
                    />
                    <ErrorMessage
                      name={`renglones.${index}.porcentaje`}
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </td>

                  {/* costo */}
                  <td className="p-2 border text-right">
                    ${calcularCostoRenglon(r).toFixed(2)}
                  </td>

                  {/* comentarios */}
                  <td className="p-2 border text-center">
                    <button
                      type="button"
                      className="bg-gray-200 px-2 py-1 rounded"
                      onClick={() => setModalComentariosIndex(index)}
                    >
                      {r.comentarios.length} Coment.
                    </button>
                  </td>

                  {/* eliminar renglón */}
                  <td className="p-2 border text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
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
