// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './components/Auth/LoginPage';
// Aquí protegemos la ruta de registro para que solo administradores y directores la vean.
import RegisterPage from './components/Auth/RegisterPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import ProtectedRoute from './components/ProtectedRoute';
import HistorialCambios from './components/Dashboard/HistorialCambios';
import EditCotizacion from './components/Dashboard/EditCotizacion';
// Importa el nuevo componente
import NuevaCotizacion from './components/Dashboard/NuevaCotizacion/NuevaCotizacion';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Login pública */}
        <Route path="/" element={<LoginPage />} />

        {/* Ruta de Registro: restringida a "administrador" y "director" */}
        <Route 
          path="/register" 
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <RegisterPage />
            </ProtectedRoute>
          } 
        />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
