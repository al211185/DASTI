import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const RegistroProveedor = () => {
  const navigate = useNavigate();

  const [materialesDB, setMaterialesDB] = useState([]);

  // Obtén la lista de materiales desde el backend
  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const res = await axiosInstance.get('/materiales');
        setMaterialesDB(res.data);
      } catch (error) {
        console.error('Error al obtener materiales:', error);
      }
    };
    fetchMateriales();
  }, []);

  const initialValues = {
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
    // Sección de materiales ofrecidos, ahora usando oferta de material con referencia y precio
    materiales: [
      {
        material: '',
        precioUnitario: ''
      }
    ],
    datosFiscales: {
      rfc: '',
      domicilioFiscal: ''
    }
  };

  // Esquema de validación básico (ajústalo según tus necesidades)
  const validationSchema = Yup.object({
    nombre: Yup.string().required('Requerido'),
    ciudad: Yup.string().required('Requerido'),
    materiales: Yup.array().of(
      Yup.object({
        material: Yup.string().required('Requerido'),
        precioUnitario: Yup.number()
          .required('Requerido')
          .min(0, 'Debe ser mayor o igual a 0')
      })
    )
    // Agrega más validaciones para otros campos si se requiere
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await axiosInstance.post('/proveedores', values);
      console.log('Proveedor registrado:', response.data);
      resetForm();
      navigate('/dashboard/registro/proveedor'); // O redirige a la lista de proveedores
    } catch (error) {
      console.error('Error al registrar proveedor:', error.response?.data || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Registrar Proveedor</h2>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="space-y-4">
            {/* Información Básica */}
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <Field name="nombre" type="text" className="w-full border rounded p-2" />
              <ErrorMessage name="nombre" component="div" className="text-red-500 text-xs" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ciudad</label>
              <Field name="ciudad" type="text" className="w-full border rounded p-2" />
              <ErrorMessage name="ciudad" component="div" className="text-red-500 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono Oficina</label>
                <Field name="telefonoOficina" type="text" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono Whatsapp</label>
                <Field name="telefonoWhatsapp" type="text" className="w-full border rounded p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <Field name="direccion" type="text" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sitio Web</label>
              <Field name="sitioWeb" type="text" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Forma de Pago</label>
              <Field name="formaPago" type="text" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contacto (Nombre)</label>
              <Field name="contactoNombre" type="text" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Razón Social</label>
              <Field name="razonSocial" type="text" className="w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CLABE Interbancaria</label>
              <Field name="clabeInterbancaria" type="text" className="w-full border rounded p-2" />
            </div>
            {/* Sección de Materiales Ofrecidos */}
            <div>
              <h3 className="text-xl font-bold mt-4">Materiales Ofrecidos</h3>
              <FieldArray name="materiales">
                {({ push, remove }) => (
                  <div>
                    {values.materiales.map((oferta, index) => (
                      <div key={index} className="border p-4 mb-2 rounded">
                        <div className="mb-2">
                          <label className="block text-sm font-medium mb-1">Material</label>
                          {/* Usamos un select para que se tomen los materiales existentes */}
                          <Field
                            as="select"
                            name={`materiales.${index}.material`}
                            className="w-full border rounded p-2"
                          >
                            <option value="">-- Selecciona un material --</option>
                            {materialesDB.map((mat) => (
                              <option key={mat._id} value={mat._id}>
                                {mat.nombre} ({mat.unidadMedida})
                              </option>
                            ))}
                          </Field>
                          <ErrorMessage name={`materiales.${index}.material`} component="div" className="text-red-500 text-xs" />
                        </div>
                        <div className="mb-2">
                          <label className="block text-sm font-medium mb-1">Precio Unitario</label>
                          <Field
                            name={`materiales.${index}.precioUnitario`}
                            type="number"
                            placeholder="Ingrese el precio unitario"
                            className="w-full border rounded p-2"
                            min="0"
                            step="0.01"
                          />
                          <ErrorMessage name={`materiales.${index}.precioUnitario`} component="div" className="text-red-500 text-xs" />
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="bg-red-500 text-white px-3 py-1 rounded mt-2"
                        >
                          Eliminar Oferta
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => push({ material: '', precioUnitario: '' })}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Agregar Material
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>
            {/* Sección de Datos Fiscales */}
            <div>
              <h3 className="text-xl font-bold mt-4">Datos Fiscales</h3>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">RFC</label>
                <Field name="datosFiscales.rfc" type="text" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Domicilio Fiscal</label>
                <Field name="datosFiscales.domicilioFiscal" type="text" className="w-full border rounded p-2" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
            >
              Registrar Proveedor
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegistroProveedor;
