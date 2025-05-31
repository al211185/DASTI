// src/components/Dashboard/Proveedores/RegistroProveedor.jsx
import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';

export default function RegistroProveedor() {
  const { id } = useParams();           // si existe → modo edición
  const navigate = useNavigate();

  const [materialesDB, setMaterialesDB] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Esquema validación
  const validationSchema = Yup.object({
    nombre: Yup.string().required('Requerido'),
    correo: Yup.string()
      .email('Correo inválido')
      .required('Requerido'),
    ciudad: Yup.string().required('Requerido'),
    materiales: Yup.array().of(
      Yup.object({
        material: Yup.string().required('Requerido'),
        precioPresentacion: Yup.number().required('Requerido').min(0, '>= 0'),
        unidadPresentacion: Yup.string().required('Requerido'),
        cantidadPresentacion: Yup.number().required('Requerido').min(0.000001, '> 0'),
        factorConversion: Yup.number().required('Requerido').min(0.000001, '> 0'),
      })
    )
  });

  // Carga materiales para el select
  useEffect(() => {
    axiosInstance.get('/materiales')
      .then(res => setMaterialesDB(res.data))
      .catch(err => console.error(err));
  }, []);

  // Define valores iniciales y carga en edición
  useEffect(() => {
    const defaults = {
      nombre: '',
      correo: '',
      comentarios: '',
      catalogo: [],
      ciudad: '',
      formaPago: '',
      sitioWeb: '',
      direccion: '',
      telefonoOficina: '',
      telefonoWhatsapp: '',
      contactoNombre: '',
      razonSocial: '',
      clabeInterbancaria: '',
      materiales: [{
        material: '',
        precioPresentacion: '',
        unidadPresentacion: '',
        cantidadPresentacion: '',
        factorConversion: '',
      }],
      datosFiscales: { rfc: '', domicilioFiscal: '' }
    };

    if (!id) {
      setInitialValues(defaults);
      return;
    }

    // modo edición: fetch y mapear a la forma del form
    axiosInstance.get(`/proveedores/${id}`)
      .then(res => {
        const data = res.data;
        setInitialValues({
          nombre: data.nombre || '',
          correo: data.correo || '',
          comentarios: data.comentarios || '',
          catalogo: data.catalogo || [],
          ciudad: data.ciudad || '',
          formaPago: data.formaPago || '',
          sitioWeb: data.sitioWeb || '',
          direccion: data.direccion || '',
          telefonoOficina: data.telefonoOficina || '',
          telefonoWhatsapp: data.telefonoWhatsapp || '',
          contactoNombre: data.contactoNombre || '',
          razonSocial: data.razonSocial || '',
          clabeInterbancaria: data.clabeInterbancaria || '',
          materiales: (data.materiales && data.materiales.length)
            ? data.materiales.map(m => ({
              material: m.material._id || m.material,
              precioPresentacion: m.precioPresentacion,
              unidadPresentacion: m.unidadPresentacion,
              cantidadPresentacion: m.cantidadPresentacion,
              factorConversion: m.factorConversion,
            }))
            : [{
              material: '',
              precioPresentacion: '',
              unidadPresentacion: '',
              cantidadPresentacion: '',
              factorConversion: '',
            }],
          datosFiscales: {
            rfc: data.datosFiscales?.rfc || '',
            domicilioFiscal: data.datosFiscales?.domicilioFiscal || ''
          }
        });
      })
      .catch(err => {
        console.error('Error al cargar proveedor:', err);
        alert('No se pudo cargar el proveedor');
        navigate(-1);
      });
  }, [id, navigate]);

  if (!initialValues) {
    return <p className="p-6 text-center">Cargando datos...</p>;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    setGuardando(true);
    setError(null);
    setMensaje(null);

    try {
      if (id) {
        await axiosInstance.put(`/proveedores/${id}`, values);
        setMensaje('Proveedor actualizado correctamente.');
      } else {
        await axiosInstance.post('/proveedores', values);
        setMensaje('Proveedor registrado correctamente.');
      }
      // opcional: redirigir a lista
      navigate('/dashboard/registro/proveedores');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Error al guardar proveedor');
    } finally {
      setGuardando(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto bg-white border rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-6">
          {id ? 'Editar Proveedor' : 'Registrar Proveedor'}
        </h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {mensaje && <p className="text-green-500 mb-2">{mensaje}</p>}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre y ciudad */}
              <Input label="Nombre" name="nombre" />
              <Input label="Correo" name="correo" type="email" />
              <Input label="Ciudad" name="ciudad" />

              {/* Teléfonos */}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Tel. Oficina" name="telefonoOficina" />
                <Input label="Tel. Whatsapp" name="telefonoWhatsapp" />
              </div>

              {/* Dirección y web */}
              <Input label="Dirección" name="direccion" />
              <Input label="Sitio Web" name="sitioWeb" />
              <Input label="Forma de Pago" name="formaPago" />
              <Input label="Contacto (Nombre)" name="contactoNombre" />
              <Input label="Razón Social" name="razonSocial" />
              <Input label="CLABE Interbancaria" name="clabeInterbancaria" />

              {/* Materiales */}
              <fieldset className="md:col-span-2 rounded-xl mt-8 space-y-6">
                <legend className="text-gray-700 font-medium px-2">Materiales Ofrecidos</legend>
                <FieldArray name="materiales">
                  {({ push, remove }) => (
                    <>
                      {values.materiales.map((_, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-gray-300 rounded-lg p-4">
                          {/* Material */}
                          <Select
                            label="Material"
                            name={`materiales.${idx}.material`}
                            options={[
                              { value: '', label: '-- Selecciona --' },
                              ...materialesDB.map(m => ({
                                value: m._id,
                                label: `${m.nombre} (${m.unidadMedida})`
                              }))
                            ]}
                          />

                          {/* Precio por presentación */}
                          <Input
                            label="Precio por presentación"
                            name={`materiales.${idx}.precioPresentacion`}
                            type="number"
                          />

                          {/* Unidad de presentación */}
                          <Select
                            label="Unidad de presentación"
                            name={`materiales.${idx}.unidadPresentacion`}
                            options={[
                              { value: '', label: '-- Selecciona unidad --' },
                              { value: 'PIES', label: 'PIES' },
                              { value: 'PULGADAS', label: 'PULGADAS' },
                              { value: 'CENTIMETROS', label: 'CENTÍMETROS' },
                              { value: 'MILIMETROS', label: 'MILÍMETROS' },
                              { value: 'LIBRAS', label: 'LIBRAS' },
                              { value: 'GRAMOS', label: 'GRAMOS' },
                              { value: 'KILOS', label: 'KILOS' },
                            ]}
                          />


                          {/* Cantidad de esa presentación */}
                          <Input
                            label="Cantidad presentación"
                            name={`materiales.${idx}.cantidadPresentacion`}
                            type="number"
                          />

                          {/* Factor de conversión */}
                          <Input
                            label="Factor de conversión"
                            name={`materiales.${idx}.factorConversion`}
                            type="number"
                          />

                          <div className="flex justify-end items-end">
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-300"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => push({
                          material: '',
                          precioPresentacion: '',
                          unidadPresentacion: '',
                          cantidadPresentacion: '',
                          factorConversion: '',
                        })}
                        className="inline-block bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark"
                      >
                        Agregar Material
                      </button>
                    </>
                  )}
                </FieldArray>
              </fieldset>

              {/* Datos fiscales */}
              <fieldset className="md:col-span-2 rounded-xl">
                <legend className="text-gray-700 font-medium px-2">Datos Fiscales</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <Input label="RFC" name="datosFiscales.rfc" />
                  <Input label="Domicilio Fiscal" name="datosFiscales.domicilioFiscal" />
                </div>
              </fieldset>

              <div className="md:col-span-2 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting || guardando}
                  className="w-full bg-orange-600 text-white py-3 rounded-full hover:bg-orange-700 disabled:opacity-50 transition"
                >
                  {guardando
                    ? 'Guardando…'
                    : id
                      ? 'Actualizar Proveedor'
                      : 'Registrar Proveedor'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

// Componentes auxiliares
const Input = ({ label, name, type = 'text' }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <Field name={name} type={type} className="w-full h-12 bg-gray-200 placeholder-gray-600 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-primary" />
    <ErrorMessage name={name} component="div" className="text-red-500 text-xs" />
  </div>
);

const Select = ({ label, name, options }) => (
  <div className="space-y-1">
    <label className="bblock text-sm font-medium text-gray-700">{label}</label>
    <Field as="select" name={name} className="w-full h-12 bg-gray-200 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Field>
    <ErrorMessage name={name} component="div" className="text-red-500 text-xs" />
  </div>
);
