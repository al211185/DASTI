// src/components/Dashboard/NuevaCotizacion/NuevaCotizacion.jsx
import React, { useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import EncabezadoCotizacion from './EncabezadoCotizacion';
import TablaRenglones from './TablaRenglones';
import ModalMateriales from './modals/ModalMateriales';
import ModalTiempos from './modals/ModalTiempos';
import ModalProveedores from './modals/ModalProveedores';
import ModalComentarios from './modals/ModalComentarios';
import ModalDocumentos from './modals/ModalDocumentos';
import axiosInstance from '../../../api/axiosInstance';

// Datos de ejemplo para selects (estos normalmente vendrían de la API)
const CLIENTES = ['Cordis', 'Cardinal', 'Cooper'];
const REQUISITORES = ['Cordis SA', 'Cardinal Inc', 'Cooper Corp'];
const VENDEDORES = ['Juan', 'María', 'Pedro'];
const PLANTAS = ['Planta A', 'Planta B'];

const validationSchema = Yup.object({
    header: Yup.object({
        cliente: Yup.string().required('Requerido'),
        requisitor: Yup.string().required('Requerido'),
        vendedor: Yup.string().required('Requerido'),
        fechaInicio: Yup.date().required('Requerido'),
        planta: Yup.string().required('Requerido'),
        serial: Yup.string().required('Requerido'),
        tiempoEntregaMin: Yup.number()
            .required('Requerido')
            .min(1, 'Debe ser mayor o igual a 1'),
        tiempoEntregaMax: Yup.number()
            .required('Requerido')
            .min(
                Yup.ref('tiempoEntregaMin'),
                'Debe ser mayor o igual al mínimo'
            ),
    }),
    renglones: Yup.array().of(
        Yup.object({
            cantidad: Yup.number().required('Requerido').min(1, 'Mínimo 1'),
            descripcion: Yup.string().required('Requerido'),
            porcentaje: Yup.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
        })
    ),
});

const NuevaCotizacion = () => {
    const initialValues = {
        header: {
            cliente: '',
            requisitor: '',
            vendedor: '',
            fechaInicio: '',
            planta: '',
            serial: 'CE-000-0001',
            tiempoEntregaMin: '',
            tiempoEntregaMax: '',
        },
        renglones: [
            {
                cantidad: 1,
                descripcion: '',
                documentos: [],
                material: [],
                tiempos: [],
                porcentaje: 0,
                costo: 0,
                comentarios: [],
            },
        ],
    };

    // Estados para controlar qué modal se abre (por índice o flags)
    const [modalMaterialesIndex, setModalMaterialesIndex] = useState(null);
    const [modalTiemposIndex, setModalTiemposIndex] = useState(null);
    const [modalProveedores, setModalProveedores] = useState({
        open: false,
        material: null,
        renglonIndex: null,
    });
    const [modalComentariosIndex, setModalComentariosIndex] = useState(null);
    const [modalDocumentosIndex, setModalDocumentosIndex] = useState(null);

    // Función para calcular el costo de un renglón
    const calcularCostoRenglon = (renglon) => {
        let costoMaterial = 0;
        if (renglon.material && renglon.material.length > 0) {
            // Supongamos que sumamos el costo de todos los materiales seleccionados
            costoMaterial = renglon.material.reduce(
                (acc, mat) =>
                    acc +
                    (mat.proveedorSeleccionado
                        ? mat.proveedorSeleccionado.precioUnitario * (mat.cantidadSeleccionada || 1)
                        : 0),
                0
            );
        }
        let costoTiempos = 0;
        if (renglon.tiempos && renglon.tiempos.length > 0) {
            costoTiempos = renglon.tiempos.reduce(
                (acc, tiempo) => acc + tiempo.horas * tiempo.costoHora,
                0
            );
        }
        const subtotal = (costoMaterial + costoTiempos) * renglon.cantidad;
        return subtotal + subtotal * (renglon.porcentaje / 100);
    };

    const calcularTotalCotizacion = (renglones) =>
        renglones.reduce((sum, r) => sum + calcularCostoRenglon(r), 0);

    // Función onSubmit: enviar datos al backend (integrar API aquí)
    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        const renglonesActualizados = values.renglones.map((renglon) => ({
            ...renglon,
            costo: calcularCostoRenglon(renglon),
        }));
        const total = calcularTotalCotizacion(renglonesActualizados);
        const cotizacionFinal = {
            ...values.header,
            renglones: renglonesActualizados,
            total,
        };

        try {
            // Envía la cotización al backend
            const response = await axiosInstance.post('/cotizaciones', cotizacionFinal);
            console.log('Cotización guardada:', response.data);
            // Reinicia el formulario o muestra una notificación de éxito
            resetForm();
            // Opcional: Redirige a una vista de listado de cotizaciones o muestra el dashboard actualizado
        } catch (error) {
            console.error('Error al guardar la cotización:', error.response?.data || error.message);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Nueva Cotización</h1>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
                {({ values, isSubmitting, setFieldValue }) => (
                    <Form>
                        {/* Encabezado */}
                        <EncabezadoCotizacion
                            header={values.header}
                            onChange={(field, value) => setFieldValue(`header.${field}`, value)}
                            clientes={CLIENTES}
                            requisitores={REQUISITORES}
                            vendedores={VENDEDORES}
                            plantas={PLANTAS}
                        />

                        {/* Tabla de Renglones */}
                        <TablaRenglones
                            renglones={values.renglones}
                            values={values}
                            setFieldValue={setFieldValue}
                            setModalMaterialesIndex={setModalMaterialesIndex}
                            setModalTiemposIndex={setModalTiemposIndex}
                            setModalProveedores={setModalProveedores}
                            setModalComentariosIndex={setModalComentariosIndex}
                            setModalDocumentosIndex={setModalDocumentosIndex}
                            calcularCostoRenglon={calcularCostoRenglon}
                        />



                        {/* Total */}
                        <div className="bg-white p-4 rounded shadow flex justify-end items-center mb-6">
                            <span className="mr-4 font-semibold">Total Cotización:</span>
                            <span className="text-xl font-bold">
                                ${calcularTotalCotizacion(values.renglones).toFixed(2)}
                            </span>
                        </div>

                        {/* Botón para guardar */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Guardar Cotización
                            </button>
                        </div>

                        {/* Modales */}
                        {modalMaterialesIndex !== null && (
                            <ModalMateriales
                                onClose={() => setModalMaterialesIndex(null)}
                                onMaterialSelect={(material) => {
                                    // Abre el modal de proveedores con el material seleccionado
                                    setModalProveedores({
                                        open: true,
                                        material, // Material seleccionado
                                        renglonIndex: modalMaterialesIndex,
                                    });
                                    setModalMaterialesIndex(null);
                                }}
                            />
                        )}

                        {modalTiemposIndex !== null && (
                            <ModalTiempos
                                onClose={() => setModalTiemposIndex(null)}
                                onTiemposSelect={(tiempo) => {
                                    const nuevosRenglones = [...values.renglones];
                                    const tiemposActuales = Array.isArray(nuevosRenglones[modalTiemposIndex].tiempos)
                                        ? nuevosRenglones[modalTiemposIndex].tiempos
                                        : [];
                                    nuevosRenglones[modalTiemposIndex].tiempos = [
                                        ...tiemposActuales,
                                        tiempo,
                                    ];
                                    setFieldValue('renglones', nuevosRenglones);
                                    // Si "Terminar" cierra el modal, modalTiemposIndex se restablece a null en onClose
                                }}
                            />
                        )}


                        {modalProveedores.open && (
                            <ModalProveedores
                                material={modalProveedores.material}
                                onClose={() =>
                                    setModalProveedores({ open: false, material: null, renglonIndex: null })
                                }
                                onProveedorSelect={(proveedor) => {
                                    const nuevosRenglones = [...values.renglones];
                                    const materialesActuales = Array.isArray(nuevosRenglones[modalProveedores.renglonIndex].material)
                                        ? nuevosRenglones[modalProveedores.renglonIndex].material
                                        : [];
                                    const nuevoMaterial = {
                                        ...modalProveedores.material,
                                        proveedorSeleccionado: proveedor,
                                    };
                                    nuevosRenglones[modalProveedores.renglonIndex].material = [
                                        ...materialesActuales,
                                        nuevoMaterial,
                                    ];
                                    setFieldValue('renglones', nuevosRenglones);
                                    setModalProveedores({ open: false, material: null, renglonIndex: null });
                                }}
                            />
                        )}


                        {modalComentariosIndex !== null && (
                            <ModalComentarios
                                comentarios={values.renglones[modalComentariosIndex].comentarios}
                                onClose={() => setModalComentariosIndex(null)}
                                onAgregarComentario={(comentario, usuario) => {
                                    const nuevosRenglones = [...values.renglones];
                                    nuevosRenglones[modalComentariosIndex].comentarios.push({
                                        texto: comentario,
                                        fecha: new Date(),
                                        usuario, // se guarda el nombre real del usuario
                                    });
                                    setFieldValue('renglones', nuevosRenglones);
                                    setModalComentariosIndex(null);
                                }}
                                usuario={/* Aquí pasa el nombre real del usuario, por ejemplo: */ 'Daniel'}
                            />
                        )}

                        {modalDocumentosIndex !== null && (
                            <ModalDocumentos
                                onClose={() => setModalDocumentosIndex(null)}
                                onDocumentSelect={(selectedFiles) => {
                                    const nuevosRenglones = [...values.renglones];
                                    nuevosRenglones[modalDocumentosIndex].documentos = selectedFiles;
                                    setFieldValue('renglones', nuevosRenglones);
                                    setModalDocumentosIndex(null);
                                }}
                            />
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default NuevaCotizacion;
