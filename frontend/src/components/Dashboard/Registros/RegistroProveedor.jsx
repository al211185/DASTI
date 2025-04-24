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
      materiales: [{ material: '', precioUnitario: '' }],
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
      // navigate('/dashboard/proveedores');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Error al guardar proveedor');
    } finally {
      setGuardando(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">
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
          <Form className="space-y-4">
            {/* Nombre y ciudad */}
            <Input label="Nombre" name="nombre" />
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
            <div>
              <h3 className="text-xl font-semibold">Materiales Ofrecidos</h3>
              <FieldArray name="materiales">
                {({ push, remove }) => (
                  <>
                    {values.materiales.map((_, idx) => (
                      <div key={idx} className="border p-4 mb-2 rounded">
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

                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="bg-red-500 text-white px-3 py-1 rounded mt-2"
                        >
                          Eliminar
                        </button>
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
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Agregar Material
                    </button>
                  </>
                )}
              </FieldArray>
            </div>

            {/* Datos fiscales */}
            <div>
              <h3 className="text-xl font-semibold">Datos Fiscales</h3>
              <Input label="RFC" name="datosFiscales.rfc" />
              <Input label="Domicilio Fiscal" name="datosFiscales.domicilioFiscal" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || guardando}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50 transition"
            >
              {guardando
                ? 'Guardando…'
                : id
                  ? 'Actualizar Proveedor'
                  : 'Registrar Proveedor'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

// Componentes auxiliares
const Input = ({ label, name, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Field name={name} type={type} className="w-full border rounded p-2" />
    <ErrorMessage name={name} component="div" className="text-red-500 text-xs" />
  </div>
);

const Select = ({ label, name, options }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Field as="select" name={name} className="w-full border rounded p-2">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Field>
    <ErrorMessage name={name} component="div" className="text-red-500 text-xs" />
  </div>
);
