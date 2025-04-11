// src/components/Dashboard/NuevaCotizacion/NuevaCotizacion.jsx
import React, { useState, useEffect } from 'react';
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


// Mapeo de prefijos para serial por planta (ajusta según tu necesidad)
const plantaPrefixMapping = {
    'Planta A': 'PA',
    'Planta B': 'PB',
    // Agrega más si es necesario
};

const validationSchema = Yup.object({
    header: Yup.object({
        cliente: Yup.string().required('Requerido'),
        requisitor: Yup.string().required('Requerido'),
        vendedor: Yup.string().required('Requerido'),
        fechaInicio: Yup.date().required('Requerido'),
        planta: Yup.string().required('Requerido'),
        serial: Yup.string(),  // Ya no es obligatorio
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
    const [clientes, setClientes] = useState([]);
    const [requisitores, setRequisitores] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [plantas, setPlantas] = useState([]);

    // Obtención de datos desde la API para cada select
    useEffect(() => {
        const fetchSelectData = async () => {
            try {
                // Ajusta las rutas a tus endpoints
                const [clientesRes, requisitoresRes, vendedoresRes, plantasRes] = await Promise.all([
                    axiosInstance.get('/clientes'),
                    axiosInstance.get('/requisitores'),
                    axiosInstance.get('/vendedores'),
                    axiosInstance.get('/plantas')
                ]);
                setClientes(clientesRes.data);
                setRequisitores(requisitoresRes.data);
                setVendedores(vendedoresRes.data);
                setPlantas(plantasRes.data);
            } catch (error) {
                console.error('Error al obtener datos para selects:', error);
            }
        };
        fetchSelectData();
    }, []);

    const initialValues = {
        header: {
            cliente: '',
            requisitor: '',
            vendedor: '',
            fechaInicio: '',
            planta: '',
            // Serial inicial: podrías definir uno fijo, o vacío
            serial: '',
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

    // Actualiza el serial basado en la planta seleccionada.
    // Este efecto se usará dentro de Formik mediante un efecto adicional.
    const handlePlantaChange = (plant, setFieldValue) => {
        // Si la planta tiene un prefijo definido, usamos ese, de lo contrario dejamos un valor genérico.
        const prefix = plantaPrefixMapping[plant] || 'XX';
        // Lógica para generar el serial. Por ejemplo: PREFIX-000-0001
        // Aquí podrías implementar lógica para contar, consultarlo en la base de datos, etc.
        const newSerial = `${prefix}-000-0001`;
        setFieldValue('header.serial', newSerial);
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
                            clientes={clientes}
                            requisitores={requisitores}
                            vendedores={vendedores}
                            plantas={plantas}
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


// Dentro del componente que utiliza ModalProveedores (en NuevaCotizacion.jsx)
                        {modalProveedores.open && (
                            <ModalProveedores
                                material={modalProveedores.material}
                                onClose={() =>
                                    setModalProveedores({ open: false, material: null, renglonIndex: null })
                                }
                                onProveedorSelect={(selected) => {
                                    const { proveedor, oferta } = selected;
                                    const nuevosRenglones = [...values.renglones];
                                    const materialesActuales = Array.isArray(nuevosRenglones[modalProveedores.renglonIndex].material)
                                        ? nuevosRenglones[modalProveedores.renglonIndex].material
                                        : [];

                                    // Agregar el precio unitario de la oferta al proveedorSeleccionado
                                    const nuevoMaterial = {
                                        ...modalProveedores.material,
                                        proveedorSeleccionado: {
                                            ...proveedor,
                                            precioUnitario: oferta ? oferta.precioUnitario : 0
                                        }
                                    };

                                    nuevosRenglones[modalProveedores.renglonIndex].material = [
                                        ...materialesActuales,
                                        nuevoMaterial
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
                                existingDocuments={values.renglones[modalDocumentosIndex].documentos}
                                onClose={() => setModalDocumentosIndex(null)}
                                onDocumentSelect={(selectedDocuments) => {
                                    const nuevosRenglones = [...values.renglones];
                                    nuevosRenglones[modalDocumentosIndex].documentos = selectedDocuments;
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
