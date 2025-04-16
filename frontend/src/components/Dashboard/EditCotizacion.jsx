// src/components/Dashboard/EditCotizacion.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import axiosInstance from '../../api/axiosInstance';
import EncabezadoCotizacion from './NuevaCotizacion/EncabezadoCotizacion';
import TablaRenglones from './NuevaCotizacion/TablaRenglones';
import ModalMateriales from './NuevaCotizacion/modals/ModalMateriales';
import ModalTiempos from './NuevaCotizacion/modals/ModalTiempos';
import ModalProveedores from './NuevaCotizacion/modals/ModalProveedores';
import ModalComentarios from './NuevaCotizacion/modals/ModalComentarios';
import ModalDocumentos from './NuevaCotizacion/modals/ModalDocumentos';
import * as Yup from 'yup';

// Ejemplo de esquema de validación con References
// (Asegúrate de modificarlo según tu caso real)
const validationSchema = Yup.object({
  header: Yup.object({
    // Si 'cliente' es un ObjectId, normalmente es un string al final (e.g. "6452f...")
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
      .min(Yup.ref('tiempoEntregaMin'), 'Debe ser mayor o igual al mínimo'),
  }),
  // Renglones, etc., si necesitas validación a detalle
});

const EditCotizacion = ({ fullName }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  // *** Agregamos estados para las listas de clientes, vendedores, plantas
  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [plantas, setPlantas] = useState([]);
  // (Si tienes un array de “requisitores” o lo generas dinámicamente en EncabezadoCotizacion, igual.)

  // ---- Estados para modales ----
  const [modalMaterialesIndex, setModalMaterialesIndex] = useState(null);
  const [modalTiemposIndex, setModalTiemposIndex] = useState(null);
  const [modalProveedores, setModalProveedores] = useState({
    open: false,
    material: null,
    renglonIndex: null,
  });
  const [modalComentariosIndex, setModalComentariosIndex] = useState(null);
  const [modalDocumentosIndex, setModalDocumentosIndex] = useState(null);

  // Al montar, cargar la cotización actual para editar
  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await axiosInstance.get(`/cotizaciones/${id}`);
        const cot = res.data.cotizacion;

        // Ajustar lo que venga de 'cot' a tu shape. Por ejemplo,
        // si 'cliente', 'planta', 'vendedor' son refs, vendrán como { _id, nombre, ... },
        // y tu form normalmente espera un string (por ejemplo, el _id).
        // Si sigues la lógica anterior, harás algo como:
        const clienteId = typeof cot.cliente === 'object' ? cot.cliente._id : cot.cliente;
        const vendedorId = typeof cot.vendedor === 'object' ? cot.vendedor._id : cot.vendedor;
        const plantaId = typeof cot.planta === 'object' ? cot.planta._id : cot.planta;

        setInitialValues({
          header: {
            cliente: clienteId || '',
            requisitor: cot.requisitor || '',
            vendedor: vendedorId || '',
            fechaInicio: new Date(cot.fechaInicio).toISOString().split('T')[0],
            planta: plantaId || '',
            serial: cot.serial || '',
            tiempoEntregaMin: cot.tiempoEntregaMin || '',
            tiempoEntregaMax: cot.tiempoEntregaMax || '',
          },
          // Asigna renglones tal cual vengan. Si necesitas limpiar o mapear algo, hazlo aquí.
          renglones: cot.renglones || [],
        });
      } catch (error) {
        console.error('Error al cargar cotización:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCotizacion();
  }, [id]);


   // *** 2) Cargar las listas de clientes, vendedores y plantas (igual que en NuevaCotizacion)
   useEffect(() => {
    const fetchDataSelects = async () => {
      try {
        // Ajusta las rutas si en tu back-end se llaman diferente
        const [clientesRes, vendedoresRes, plantasRes] = await Promise.all([
          axiosInstance.get('/clientes'),
          axiosInstance.get('/vendedores'),
          axiosInstance.get('/plantas'),
        ]);
        setClientes(clientesRes.data);
        setVendedores(vendedoresRes.data);
        setPlantas(plantasRes.data);
      } catch (error) {
        console.error('Error al obtener datos de select:', error);
      }
    };
    fetchDataSelects();
  }, []);

  if (loading || !initialValues) return <div>Cargando cotización...</div>;

  // -------------- Funciones de cálculo de costos --------------
  const calcularCostoRenglon = (renglon) => {
    let costoMaterial = 0;
    if (Array.isArray(renglon.material) && renglon.material.length > 0) {
      costoMaterial = renglon.material.reduce((acc, mat) => {
        return (
          acc +
          (mat.proveedorSeleccionado
            ? mat.proveedorSeleccionado.precioUnitario * (mat.cantidadSeleccionada || 1)
            : 0)
        );
      }, 0);
    }
    let costoTiempos = 0;
    if (Array.isArray(renglon.tiempos) && renglon.tiempos.length > 0) {
      costoTiempos = renglon.tiempos.reduce(
        (acc, tiempo) => acc + tiempo.horas * tiempo.costoHora,
        0
      );
    }
    const subtotal = (costoMaterial + costoTiempos) * (renglon.cantidad || 1);
    return subtotal + subtotal * ((renglon.porcentaje || 0) / 100);
  };

  const calcularTotalCotizacion = (renglones) =>
    renglones.reduce((sum, r) => sum + calcularCostoRenglon(r), 0);

  // -------------- onSubmit: PUT a /cotizaciones/:id --------------
  const onSubmit = async (values, { setSubmitting }) => {
    const renglonesActualizados = values.renglones.map((r) => ({
      ...r,
      costo: calcularCostoRenglon(r),
    }));

    const total = calcularTotalCotizacion(renglonesActualizados);
    // Mandas un objeto que coincida con tu controlador
    // Asumiendo que 'cliente', 'planta', 'vendedor' esperan el _id (string)
    // y que tu back ya se encarga de .populate() cuando hace GET
    const cotizacionFinal = {
      ...values.header,
      renglones: renglonesActualizados,
      total,
    };

    try {
      const res = await axiosInstance.put(`/cotizaciones/${id}`, cotizacionFinal);
      console.log('Cotización actualizada:', res.data);
      // Redirigir a dashboard o donde gustes
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al actualizar cotización:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------- Renderizado principal --------------
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Editar Cotización</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            {/* ---- EncabezadoCotizacion (aquí asumes que tiene selects para cliente/vendedor/planta) ---- */}
            <EncabezadoCotizacion
              header={values.header}
              onChange={(field, value) => setFieldValue(`header.${field}`, value)}
              // Estos array podrían venir de un fetch a /clientes, /vendedores, /plantas, etc.
              // *** Pasamos las listas reales al Encabezado para que cargue <select> con datos correctos
              clientes={clientes}
              // "Requisitores" ya se manejan en EncabezadoCotizacion al seleccionar un cliente y extraer contactos
              vendedores={vendedores}
              plantas={plantas}
            />

            {/* ---- TablaRenglones ---- */}
            <TablaRenglones
              renglones={values.renglones}
              values={values}
              setFieldValue={setFieldValue}
              setModalMaterialesIndex={setModalMaterialesIndex}
              setModalTiemposIndex={setModalTiemposIndex}
              setModalProveedores={setModalProveedores}
              setModalComentariosIndex={setModalComentariosIndex}
              setModalDocumentosIndex={setModalDocumentosIndex}
              // Si necesitas usar calcularCostoRenglon dentro:
              calcularCostoRenglon={calcularCostoRenglon}
            />

            {/* ---- Total ---- */}
            <div className="bg-white p-4 rounded shadow flex justify-end items-center mb-6">
              <span className="mr-4 font-semibold">Total Cotización:</span>
              <span className="text-xl font-bold">
                ${calcularTotalCotizacion(values.renglones).toFixed(2)}
              </span>
            </div>

            {/* ---- Botón de guardar ---- */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Guardar Cambios
              </button>
            </div>

            {/* ---- Modales (materiales, tiempos, proveedores, comentarios, documentos) ---- */}
            {modalMaterialesIndex !== null && (
              <ModalMateriales
                onClose={() => setModalMaterialesIndex(null)}
                onMaterialSelect={(material) => {
                  setModalProveedores({
                    open: true,
                    material,
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
                  const tiemposActuales = Array.isArray(
                    nuevosRenglones[modalTiemposIndex].tiempos
                  )
                    ? nuevosRenglones[modalTiemposIndex].tiempos
                    : [];
                  nuevosRenglones[modalTiemposIndex].tiempos = [...tiemposActuales, tiempo];
                  setFieldValue('renglones', nuevosRenglones);
                  setModalTiemposIndex(null);
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
                  const materialesActuales = Array.isArray(
                    nuevosRenglones[modalProveedores.renglonIndex].material
                  )
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
                    usuario,
                  });
                  setFieldValue('renglones', nuevosRenglones);
                  setModalComentariosIndex(null);
                }}
                usuario={fullName}
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

export default EditCotizacion;
