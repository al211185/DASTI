import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../../context/UserContext'; // <-- Importa tu UserContext
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useLocation } from 'react-router-dom';
import EncabezadoCotizacion from './EncabezadoCotizacion';
import TablaRenglones from './TablaRenglones';
import ModalMateriales from './modals/ModalMateriales';
import ModalTiempos from './modals/ModalTiempos';
import ModalProveedores from './modals/ModalProveedores';
import ModalComentarios from './modals/ModalComentarios';
import ModalDocumentos from './modals/ModalDocumentos';
import HistorialCotizacion from './modals/HistorialCotizacion';
import axiosInstance from '../../../api/axiosInstance';

// Mapeo de prefijos para serial por planta
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
        serial: Yup.string(),
        tiempoEntregaMin: Yup.number()
            .required('Requerido')
            .min(1, 'Debe ser mayor o igual a 1'),
        tiempoEntregaMax: Yup.number()
            .required('Requerido')
            .min(Yup.ref('tiempoEntregaMin'), 'Debe ser mayor o igual al mínimo'),
    }),
    renglones: Yup.array().of(
        Yup.object({
            cantidad: Yup.number().required('Requerido').min(1, 'Mínimo 1'),
            descripcion: Yup.string().required('Requerido'),
            porcentaje: Yup.number().min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
        })
    ),
});

// Valores por defecto para una nueva cotización
const defaultInitialValues = {
    header: {
        cliente: '',
        requisitor: '',
        vendedor: '',
        fechaInicio: '',
        planta: '',
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

const NuevaCotizacion = () => {
    const location = useLocation();
    const duplicatedCotizacion = location.state;
    const initialValues = duplicatedCotizacion || defaultInitialValues;

    const { user } = useContext(UserContext);

    // Estados para selects, modales y mensaje de éxito
    const [clientes, setClientes] = useState([]);
    const [requisitores, setRequisitores] = useState([]);
    const [vendedores, setVendedores] = useState([]);
    const [plantas, setPlantas] = useState([]);
    const [modalHistorialId, setModalHistorialId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Obtención de datos para selects
    useEffect(() => {
        const fetchSelectData = async () => {
            try {
                const [clientesRes, requisitoresRes, vendedoresRes, plantasRes] = await Promise.all([
                    axiosInstance.get('/clientes'),
                    axiosInstance.get('/requisitores'),
                    axiosInstance.get('/vendedores'),
                    axiosInstance.get('/plantas'),
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

    const handlePlantaChange = (plant, setFieldValue) => {
        const prefix = plantaPrefixMapping[plant] || 'XX';
        const newSerial = `${prefix}-000-0001`;
        setFieldValue('header.serial', newSerial);
    };

    // Estados para modales
    const [modalMaterialesIndex, setModalMaterialesIndex] = useState(null);
    const [modalTiemposIndex, setModalTiemposIndex] = useState(null);
    const [modalProveedores, setModalProveedores] = useState({
        open: false,
        material: null,
        renglonIndex: null,
    });
    const [modalComentariosIndex, setModalComentariosIndex] = useState(null);
    const [modalDocumentosIndex, setModalDocumentosIndex] = useState(null);

    // Reemplaza tu función actual por esta en NuevaCotizacion.jsx
    const calcularCostoRenglon = (renglon) => {
        // 1) Costo de materiales: qty * precioUnitario
        const costoMaterial = (renglon.material || []).reduce((sum, mat) => {
            const qty = mat.cantidad || 0;
            const price = mat.proveedorSeleccionado?.precioUnitario || 0;
            return sum + qty * price;
        }, 0);

        // 2) Costo de tiempos (igual que antes)
        const costoTiempos = (renglon.tiempos || []).reduce(
            (sum, t) => sum + (t.horas || 0) * (t.costoHora || 0),
            0
        );

        // 3) Subtotal por unidad de renglón
        const costoPorUnidad = costoMaterial + costoTiempos;

        // 4) Multiplica por la cantidad global del renglón (renglon.cantidad)
        const subtotal = costoPorUnidad * (renglon.cantidad || 1);

        // 5) Aplica el porcentaje
        return subtotal * (1 + (renglon.porcentaje || 0) / 100);
    };


    const calcularTotalCotizacion = (renglones) =>
        renglones.reduce((sum, r) => sum + calcularCostoRenglon(r), 0);

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
            const response = await axiosInstance.post('/cotizaciones', cotizacionFinal);
            console.log('Cotización guardada:', response.data);
            // Mostrar mensaje de éxito
            setSuccessMessage('¡Cotización guardada exitosamente!');
            resetForm();
            // Limpiar el mensaje tras unos segundos (por ejemplo, 3 segundos)
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error al guardar la cotización:', error.response?.data || error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">Nueva Cotización</h1>
            {/* Muestra el mensaje de éxito si existe */}
            {successMessage && (
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
                    {successMessage}
                </div>
            )}
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {({ values, isSubmitting, setFieldValue }) => (
                    <Form>
                        <EncabezadoCotizacion
                            header={values.header}
                            onChange={(field, value) => setFieldValue(`header.${field}`, value)}
                            clientes={clientes}
                            requisitores={requisitores}
                            vendedores={vendedores}
                            plantas={plantas}
                        />
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
                        {values._id && (
                            <button
                                type="button"
                                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                                onClick={() => setModalHistorialId(values._id)}
                            >
                                Ver Historial
                            </button>
                        )}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border flex justify-end items-center mb-6">
                            <span className="mr-4 font-semibold">Total Cotización:</span>
                            <span className="text-xl font-bold">${calcularTotalCotizacion(values.renglones).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isSubmitting} className="bg-secondary hover:bg-secondary-dark text-white font-medium px-4 py-2 rounded-lg shadow transition">
                                Guardar Cotización
                            </button>
                        </div>
                        {modalMaterialesIndex !== null && (
                            <ModalMateriales
                                onClose={() => setModalMaterialesIndex(null)}
                                onMaterialSelect={(material) => {
                                    setModalProveedores({ open: true, material, renglonIndex: modalMaterialesIndex });
                                    setModalMaterialesIndex(null);
                                }}
                            />
                        )}
                        {modalTiemposIndex !== null && (
                            <ModalTiempos
                                tipo={modalTiemposIndex.tipo}
                                onClose={() => setModalTiemposIndex(null)}
                                onTiemposSelect={(tiempo) => {
                                    // agrega el nuevo tiempo incluyendo su .tipo
                                    const nuevos = [...values.renglones];
                                    nuevos[modalTiemposIndex.index].tiempos.push(tiempo);
                                    setFieldValue('renglones', nuevos);
                                    // cerramos el modal
                                    setModalTiemposIndex(null);
                                }}
                            />
                        )}
                        {modalProveedores.open && (
                            <ModalProveedores
                                material={modalProveedores.material}
                                onClose={() => setModalProveedores({ open: false, material: null, renglonIndex: null })}
                                onProveedorSelect={(selected) => {
                                    const { proveedor, oferta } = selected;
                                    const nuevosRenglones = [...values.renglones];
                                    const materialesActuales = Array.isArray(nuevosRenglones[modalProveedores.renglonIndex].material)
                                        ? nuevosRenglones[modalProveedores.renglonIndex].material
                                        : [];
                                    const nuevoMaterial = {
                                        ...modalProveedores.material,
                                        proveedorSeleccionado: {
                                            ...proveedor,
                                            precioUnitario: oferta ? oferta.precioUnitario : 0,
                                        },
                                        unidadPresentacion: oferta?.unidadPresentacion,
                                        cantidadPresentacion: oferta?.cantidadPresentacion,
                                        cantidad: 1        // <= aquí le das valor inicial
                                    };
                                    nuevosRenglones[modalProveedores.renglonIndex].material = [...materialesActuales, nuevoMaterial];
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
                                        usuario,
                                    });
                                    setFieldValue('renglones', nuevosRenglones);
                                    setModalComentariosIndex(null);
                                }}
                                usuario={user?.nombre || user?.email || 'Desconocido'} // <-- en vez de "Daniel"
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
                        {modalHistorialId && (
                            <HistorialCotizacion
                                cotizacionId={modalHistorialId}
                                onClose={() => setModalHistorialId(null)}
                            />
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default NuevaCotizacion;
