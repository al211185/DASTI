import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage';
// Mantienes la ruta de registro de usuario si la quieres, pero en este ejemplo usaremos la ruta
// /dashboard/registro/usuario para registrar un usuario a través del flujo de registros.
import RegisterPage from './components/Auth/RegisterPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import ProtectedRoute from './components/ProtectedRoute';
import HistorialCambios from './components/Dashboard/HistorialCambios';
import EditCotizacion from './components/Dashboard/EditCotizacion';
import NuevaCotizacion from './components/Dashboard/NuevaCotizacion/NuevaCotizacion';

// Importa los nuevos componentes de registros
import RegistroSeleccion from './components/Dashboard/Registros/RegistroSeleccion';
import RegistroPlanta from './components/Dashboard/Registros/RegistroPlanta';
import RegistroCliente from './components/Dashboard/Registros/RegistroCliente';
import RegistroMaterial from './components/Dashboard/Registros/RegistroMaterial'; // Ajusta la ruta si es necesario
import RegistroCategoria from './components/Dashboard/Registros/RegistroCategoria';
import RegistroProveedor from './components/Dashboard/Registros/RegistroProveedor';

// Para el registro de usuario puedes reutilizar o importar un componente específico si se desea
// Diferente al RegisterPage, que puede funcionar para el registro público.
import RegistroUsuario from './components/Dashboard/Registros/RegistroUsuario';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Ruta pública o restringida para el registro de usuario, 
            dependiendo de tu política. Por ejemplo, si el registro público de usuario es permitido: */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas del Dashboard (Protegidas) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Nueva Cotización */}
        <Route
          path="/dashboard/nueva-cotizacion"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <NuevaCotizacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Historial de cambios para una cotización específica */}
        <Route
          path="/dashboard/cotizacion/:id/historial"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <HistorialCambios />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/editar-cotizacion/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditCotizacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Rutas para el proceso de registro (solo accesible para "administrador" y "director") */}
        <Route
          path="/dashboard/registro-seleccion"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroSeleccion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registro/planta"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroPlanta />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registro/cliente"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroCliente />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registro/usuario"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroUsuario />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registro/material"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroMaterial />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registro/categoria"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroCategoria />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/registro/proveedor"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout>
                <RegistroProveedor />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
