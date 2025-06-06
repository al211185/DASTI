// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import ProtectedRoute from './components/ProtectedRoute';
import HistorialCambios from './components/Dashboard/HistorialCambios';
import EditCotizacion from './components/Dashboard/EditCotizacion';
import NuevaCotizacion from './components/Dashboard/NuevaCotizacion/NuevaCotizacion';
import VerCotizacion from './components/Dashboard/VerCotizacion';
import SearchGlobal from './components/GlobalSearch/SearchGlobal';

import MostrarCotizacion from './components/Dashboard/MostrarCotizacion';

import ListadoMateriales from './components/Dashboard/Registros/ListadoMateriales';

import RegistroSeleccion from './components/Dashboard/Registros/RegistroSeleccion';
import RegistroPlanta from './components/Dashboard/Registros/RegistroPlanta';
import RegistroCliente from './components/Dashboard/Registros/RegistroCliente';
import RegistroMaterial from './components/Dashboard/Registros/RegistroMaterial';
import RegistroCategoria from './components/Dashboard/Registros/RegistroCategoria';
import RegistroProveedor from './components/Dashboard/Registros/RegistroProveedor';
import RegistroMaquina from './components/Dashboard/Registros/RegistroMaquina';
import RegistroUsuario from './components/Dashboard/Registros/RegistroUsuario';

import ContactosProveedor from './components/Dashboard/Proveedores/ContactosProveedor';

import ListadoPlantas from './components/Dashboard/Registros/ListadoPlantas';
import ListadoClientes from './components/Dashboard/Registros/ListadoClientes';
import ListadoUsuarios from './components/Dashboard/Registros/ListadoUsuarios';
import ListadoCategorias from './components/Dashboard/Registros/ListadoCategorias';
import ListadoProveedores from './components/Dashboard/Registros/ListadoProveedores';
import ListadoMaquinas from './components/Dashboard/Registros/ListadoMaquinas';

import SolicitudesAprobacion from './components/Dashboard/SolicitudesAprobacion';

import { SocketProvider } from './context/SocketContext';
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <BrowserRouter>
          <ToastContainer />

          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Todas las rutas de /dashboard usan el mismo layout */}
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
            <Route
  path="/dashboard/mostrar-cotizacion/:id"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <MostrarCotizacion />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
            <Route
              path="/dashboard/cotizacion/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <VerCotizacion />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Rutas de registros, cada una dentro de DashboardLayout */}
            <Route
              path="/dashboard/registro-seleccion"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
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
              path="/dashboard/registro/plantas"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <ListadoPlantas />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/planta/:id"
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
              path="/dashboard/registro/clientes"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <ListadoClientes />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/cliente/:id"
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
              path="/dashboard/registro/usuarios"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <ListadoUsuarios />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/usuario/:id"
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
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <RegistroMaterial />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/materiales"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <ListadoMateriales />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/material/:id"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <RegistroMaterial />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/registro/categoria"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <RegistroCategoria />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/categorias"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <ListadoCategorias />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/categoria/:id"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <RegistroCategoria />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/registro/proveedor"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <RegistroProveedor />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/proveedores"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <ListadoProveedores />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/proveedor/:id"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <RegistroProveedor />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/registro/contactos"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
                  <DashboardLayout>
                    <ContactosProveedor />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/registro/maquina"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <RegistroMaquina />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/maquinas"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <ListadoMaquinas />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/registro/maquina/:id"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <RegistroMaquina />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/solicitudes-aprobacion"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'director']}>
                  <DashboardLayout>
                    <SolicitudesAprobacion />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/buscar-proyectos"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SearchGlobal />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </UserProvider>
  );
}

export default App;
