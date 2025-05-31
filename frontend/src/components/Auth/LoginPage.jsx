// src/components/Auth/LoginPage.jsx
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LogoVec from '../../Images/Dasty_Logo_Vectorizado.png';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const initialValues = { email: '', password: '' };
  const validationSchema = Yup.object({
    email: Yup.string().email('Email inválido').required('Requerido'),
    password: Yup.string().required('Requerido'),
  });

  const onSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await login(values);
      navigate('/dashboard');
    } catch (error) {
      setStatus({ error: error.response?.data?.msg || 'Error al iniciar sesión' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <img
          src={LogoVec}
          alt="DASTI‑Logo"
          className="mx-auto mb-2 h-32"
        />
        <h1 className="text-2xl font-semibold mb-6 text-gray-800">Inicia sesión</h1>
        <p className="text-[#313D4F] mb-10">Por favor ingresa tu usuario y contraseña para continuar</p>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y-6">
              {status?.error && <div className="text-red-500 text-sm">{status.error}</div>}
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full h-12 bg-[#D8D8D8] placeholder-gray-500 text-gray-800 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-[#107CBC]"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1"/>
              </div>
              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  className="w-full h-12 bg-[#D8D8D8] placeholder-gray-500 text-gray-800 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-[#107CBC]"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1"/>
              </div>
              <div className="text-right text-sm mb-4">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[#313D4F] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#107CBC] hover:bg-opacity-90 text-white font-medium rounded-full transition"
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </button>
            </Form>
          )}
        </Formik>

        {/* Sección de Registro (oculta) */}
        {false && (
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              ¿Aún no tienes cuenta?
            </h3>
            <p className="text-[#313D4F] mb-6">
              Regístrate de forma rápida y sencilla para trabajar con nosotros
            </p>
            <Link
              to="/register"
              className="inline-block bg-[#107CBC] text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition"
            >
              Registrarme
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;