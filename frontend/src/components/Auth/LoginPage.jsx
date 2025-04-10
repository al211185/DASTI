// src/components/Auth/LoginPage.jsx
import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Si ya hay token, redirige al Home (o ruta protegida)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const initialValues = { email: '', password: '' };
  const validationSchema = Yup.object({
    email: Yup.string().email('Email inválido').required('Requerido'),
    password: Yup.string().required('Requerido'),
  });

const onSubmit = async (values, { setSubmitting, setStatus }) => {
  try {
    await login(values);
    setStatus({ success: 'Inicio de sesión exitoso' });
    navigate('/dashboard'); // Redirige al Dashboard
  } catch (error) {
    const errorMsg = error.response?.data?.msg || 'Error al iniciar sesión';
    setStatus({ error: errorMsg });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Sección Izquierda: Formulario de Login */}
      <div className="w-full md:w-1/2 bg-gray-100 flex flex-col justify-center items-center p-8">
        {/* Logo (opcional) */}
        <img
          src="/logo.png"
          alt="DASTI-CORP"
          className="h-12 mb-4"
        />
        <h2 className="text-2xl font-bold mb-2">Inicia sesión</h2>
        <p className="text-gray-600 mb-6 text-center">
          Por favor ingresa tu usuario y contraseña para continuar
        </p>

        {/* Formik */}
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
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 mb-2"
                  />
                </div>
                <div>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    className="w-full p-2 mb-4 border rounded"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-red-500 mb-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full p-2 bg-blue-500 text-white rounded"
                >
                  {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Sección Derecha: Enlace a Registro */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <h3 className="text-xl font-semibold mb-2">¿Aún no tienes cuenta?</h3>
        <p className="text-gray-600 mb-6 text-center">
          Regístrate de forma rápida y sencilla para trabajar con nosotros
        </p>
        <Link
          to="/register"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Registrarme
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
