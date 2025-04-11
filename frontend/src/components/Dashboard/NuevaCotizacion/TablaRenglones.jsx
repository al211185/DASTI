import React from 'react';
import { Field, ErrorMessage, FieldArray } from 'formik';

const TablaRenglones = ({
    renglones,
    values,
    setFieldValue,
    setModalMaterialesIndex,
    setModalTiemposIndex,
    setModalProveedores,
    setModalComentariosIndex,
    setModalDocumentosIndex, // Se usa para abrir el modal y guardar el índice
}) => {
    return (
        <FieldArray name="renglones">
            {({ push, remove }) => (
                <div className="bg-white p-4 rounded shadow mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Renglones</h2>
                        <button
                            type="button"
                            onClick={() =>
                                push({
                                    cantidad: 1,
                                    descripcion: '',
                                    documentos: [],
                                    material: [], // ahora es array
                                    tiempos: [],  // ahora es array
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
                            {renglones.map((renglon, index) => (
                                <tr key={index}>
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
                                    {/* Columna Documentos */}
                                    <td className="p-2 border text-center">
                                        {renglon.documentos && renglon.documentos.length > 0 ? (
                                            <div>
                                                {renglon.documentos.map((doc, idx) => (
                                                    <div key={idx} className="mb-1">
                                                        {/* Si es imagen, se muestra una miniatura; si no, un enlace */}
                                                        {doc.url && doc.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                            <img
                                                                src={doc.url}
                                                                alt={doc.originalName}
                                                                className="h-10 inline-block"
                                                                title={doc.originalName}
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
                                                {/* Botón para editar o subir nuevos documentos */}
                                                <button
                                                    type="button"
                                                    className="bg-gray-200 px-2 py-1 rounded mt-2"
                                                    onClick={() => setModalDocumentosIndex(index)}
                                                >
                                                    Editar Documentos
                                                </button>
                                            </div>
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

                                    {/* Columna Material */}
                                    <td className="p-2 border text-center">
                                        <div className="flex flex-col items-center">
                                            {Array.isArray(renglon.material) && renglon.material.length > 0 ? (
                                                <div className="mb-2">
                                                    {renglon.material.map((mat, idx) => (
                                                        <div key={idx} className="flex items-center space-x-1">
                                                            <span className="text-sm">{mat.nombre}</span>
                                                            {mat.proveedorSeleccionado && (
                                                                <>
                                                                    <span className="text-xs text-gray-500">
                                                                        ({mat.proveedorSeleccionado.nombre})
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        - ${mat.proveedorSeleccionado.precioUnitario}
                                                                    </span>
                                                                </>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="text-red-500 text-xs"
                                                                onClick={() => {
                                                                    const nuevosRenglones = [...values.renglones];
                                                                    const nuevosMateriales = nuevosRenglones[index].material.filter(
                                                                        (_, i) => i !== idx
                                                                    );
                                                                    nuevosRenglones[index].material = nuevosMateriales;
                                                                    setFieldValue('renglones', nuevosRenglones);
                                                                }}
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}

                                            <button
                                                type="button"
                                                className="bg-gray-200 px-2 py-1 rounded"
                                                onClick={() => setModalMaterialesIndex(index)}
                                            >
                                                Agregar material
                                            </button>
                                        </div>
                                    </td>

                                    {/* Columna Tiempos */}
                                    <td className="p-2 border text-center">
                                        <div className="flex flex-col items-center">
                                            {Array.isArray(renglon.tiempos) && renglon.tiempos.length > 0 ? (
                                                <div className="mb-2">
                                                    {renglon.tiempos.map((t, idx) => (
                                                        <div key={idx} className="flex items-center space-x-1">
                                                            <span className="text-sm">
                                                                {t.maquina} ({t.horas} hrs)
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="text-red-500 text-xs"
                                                                onClick={() => {
                                                                    const nuevosRenglones = [...values.renglones];
                                                                    const nuevosTiempos = nuevosRenglones[index].tiempos.filter(
                                                                        (_, i) => i !== idx
                                                                    );
                                                                    nuevosRenglones[index].tiempos = nuevosTiempos;
                                                                    setFieldValue('renglones', nuevosRenglones);
                                                                }}
                                                            >
                                                                X
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                            <button
                                                type="button"
                                                className="bg-gray-200 px-2 py-1 rounded"
                                                onClick={() => setModalTiemposIndex(index)}
                                            >
                                                Agregar Maquina
                                            </button>
                                        </div>
                                    </td>

                                    <td className="p-2 border text-center">
                                        {Array.isArray(renglon.tiempos) && renglon.tiempos.length > 0
                                            ? (renglon.tiempos.reduce((total, t) => total + t.horas, 0) / 8).toFixed(2)
                                            : '0'}
                                    </td>

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
                                    <td className="p-2 border text-right">
                                        ${renglon.costo.toFixed(2)}
                                    </td>

                                    <td className="p-2 border text-center">
                                        <button
                                            type="button"
                                            className="bg-gray-200 px-2 py-1 rounded"
                                            onClick={() => setModalComentariosIndex(index)}
                                        >
                                            {renglon.comentarios.length} Coment.
                                        </button>
                                    </td>
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
                    {/* Aquí se renderiza el ModalDocumentos si se ha seleccionado un renglón para documentos */}
                    {typeof setModalDocumentosIndex === 'function' && null}
                </div>
            )}
        </FieldArray>
    );
};

export default TablaRenglones;
