// src/components/Auth/RegisterPage.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const { register } = useAuth();

  const initialValues = {
    nombre: '',
    email: '',
    password: '',
    telefono: '',      // Si es opcional, puedes dejarlo vacío o validarlo como opcional
    empleadoID: '',    // Igual que teléfono
    departamento: 'ventas', // Valor predeterminado válido; puedes cambiarlo según tu lógica
    rol: 'vendedor',        // Valor predeterminado según el modelo
  };

  const validationSchema = Yup.object({
    nombre: Yup.string().required('Requerido'),
    email: Yup.string().email('Email inválido').required('Requerido'),
    password: Yup.string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .required('Requerido'),
    telefono: Yup.string(),       // Opcional si así lo deseas
    empleadoID: Yup.string(),     // Opcional si así lo deseas
    departamento: Yup.string()
      .oneOf(
        ['administración', 'ventas', 'requisiciones', 'diseño', 'producción'],
        'Seleccione un departamento válido'
      )
      .required('Requerido'),
    rol: Yup.string()
      .oneOf(
        ['administrador', 'vendedor', 'requisitor', 'diseñador'],
        'Seleccione un rol válido'
      )
      .required('Requerido'),
  });

  const onSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await register(values);
      setStatus({ success: 'Usuario registrado correctamente' });
    } catch (error) {
      const errorMsg =
        error.response?.data?.msg || 'Error al registrar usuario';
      setStatus({ error: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sección Izquierda: Enlace a Login */}
      <div className="w-full md:w-1/2 bg-gray-100 flex flex-col justify-center items-center p-8">
        <img src="/logo.png" alt="DASTI-CORP" className="h-12 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h2>
        <p className="text-gray-600 mb-6 text-center">
          Si ya tienes cuenta, inicia sesión
        </p>
        <Link
          to="/"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Iniciar sesión
        </Link>
      </div>

      {/* Sección Derecha: Formulario de Registro */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <h3 className="text-2xl font-semibold mb-2">Crear cuenta</h3>
        <div className="w-full max-w-sm">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting, status }) => (
              <Form>
                {status?.error && (
                  <p className="text-red-500 mb-2">{status.error}</p>
                )}
                {status?.success && (
                  <p className="text-green-500 mb-2">{status.success}</p>
                )}
                <div className="mb-4">
                  <Field
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage
                    name="nombre"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="mb-4">
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="mb-4">
                  <Field
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Opcionales: teléfono y empleadoID */}
                <div className="mb-4">
                  <Field
                    type="text"
                    name="telefono"
                    placeholder="Teléfono"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage
                    name="telefono"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="mb-4">
                  <Field
                    type="text"
                    name="empleadoID"
                    placeholder="ID de empleado"
                    className="w-full p-2 border rounded"
                  />
                  <ErrorMessage
                    name="empleadoID"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Select para Departamento */}
                <div className="mb-4">
                  <label className="block text-sm mb-1">Departamento</label>
                  <Field
                    as="select"
                    name="departamento"
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccione un departamento</option>
                    <option value="administración">Administración</option>
                    <option value="ventas">Ventas</option>
                    <option value="requisiciones">Requisiciones</option>
                    <option value="diseño">Diseño</option>
                    <option value="producción">Producción</option>
                  </Field>
                  <ErrorMessage
                    name="departamento"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {/* Select para Rol */}
                <div className="mb-4">
                  <label className="block text-sm mb-1">Rol</label>
                  <Field
                    as="select"
                    name="rol"
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccione un rol</option>
                    <option value="administrador">Administrador</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="requisitor">Requisitor</option>
                    <option value="diseñador">Diseñador</option>
                  </Field>
                  <ErrorMessage
                    name="rol"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full p-2 bg-green-500 text-white rounded"
                >
                  {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
