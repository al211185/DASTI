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
      .min(Yup.ref('tiempoEntregaMin'), 'Debe ser mayor o igual al mínimo'),
  }),
  // Puedes agregar validaciones adicionales para renglones según tus necesidades
});

const EditCotizacion = ({ fullName }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para controlar los modales
  const [modalMaterialesIndex, setModalMaterialesIndex] = useState(null);
  const [modalTiemposIndex, setModalTiemposIndex] = useState(null);
  const [modalProveedores, setModalProveedores] = useState({
    open: false,
    material: null,
    renglonIndex: null,
  });
  const [modalComentariosIndex, setModalComentariosIndex] = useState(null);
  const [modalDocumentosIndex, setModalDocumentosIndex] = useState(null);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await axiosInstance.get(`/cotizaciones/${id}`);
        const cot = res.data.cotizacion;
        setInitialValues({
          header: {
            cliente: cot.cliente,
            requisitor: cot.requisitor,
            vendedor: cot.vendedor,
            fechaInicio: new Date(cot.fechaInicio)
              .toISOString()
              .split('T')[0],
            planta: cot.planta,
            serial: cot.serial,
            tiempoEntregaMin: cot.tiempoEntregaMin || '',
            tiempoEntregaMax: cot.tiempoEntregaMax || '',
          },
          renglones: cot.renglones,
        });
      } catch (error) {
        console.error('Error al cargar cotización:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCotizacion();
  }, [id]);

  if (loading || !initialValues) return <div>Cargando cotización...</div>;

  // Función para calcular el costo de un renglón
  const calcularCostoRenglon = (renglon) => {
    let costoMaterial = 0;
    if (Array.isArray(renglon.material) && renglon.material.length > 0) {
      costoMaterial = renglon.material.reduce((acc, mat) => {
        return acc + (mat.proveedorSeleccionado
          ? mat.proveedorSeleccionado.precioUnitario * (mat.cantidadSeleccionada || 1)
          : 0);
      }, 0);
    }
    let costoTiempos = 0;
    if (Array.isArray(renglon.tiempos) && renglon.tiempos.length > 0) {
      costoTiempos = renglon.tiempos.reduce(
        (acc, tiempo) => acc + tiempo.horas * tiempo.costoHora,
        0
      );
    }
    const subtotal = (costoMaterial + costoTiempos) * renglon.cantidad;
    return subtotal + subtotal * (renglon.porcentaje / 100);
  };

  // Función para calcular el total de la cotización
  const calcularTotalCotizacion = (renglones) =>
    renglones.reduce((sum, r) => sum + calcularCostoRenglon(r), 0);

  const onSubmit = async (values, { setSubmitting }) => {
    // Recalcular el costo de cada renglón
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
      const res = await axiosInstance.put(`/cotizaciones/${id}`, cotizacionFinal);
      console.log('Cotización actualizada:', res.data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al actualizar cotización:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Editar Cotización</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <EncabezadoCotizacion
              header={values.header}
              onChange={(field, value) => setFieldValue(`header.${field}`, value)}
              clientes={['Cordis', 'Cardinal', 'Cooper']}
              requisitores={['Cordis SA', 'Cardinal Inc', 'Cooper Corp']}
              vendedores={['Juan', 'María', 'Pedro']}
              plantas={['Planta A', 'Planta B']}
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
            />

            <div className="bg-white p-4 rounded shadow flex justify-end items-center mb-6">
              <span className="mr-4 font-semibold">Total Cotización:</span>
              <span className="text-xl font-bold">
                ${calcularTotalCotizacion(values.renglones).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Guardar Cambios
              </button>
            </div>

            {/* Modales */}
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
                  const tiemposActuales = Array.isArray(nuevosRenglones[modalTiemposIndex].tiempos)
                    ? nuevosRenglones[modalTiemposIndex].tiempos
                    : [];
                  nuevosRenglones[modalTiemposIndex].tiempos = [
                    ...tiemposActuales,
                    tiempo,
                  ];
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
