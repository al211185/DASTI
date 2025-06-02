// src/App.jsx
import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
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

// ¡Asegúrate de importar ListadoMateriales!
import ListadoMateriales from './components/Dashboard/Registros/ListadoMateriales';

// Componentes de registros
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

import { SocketProvider, useSocket } from './context/SocketContext';
import { UserContext, UserProvider } from './context/UserContext';
import NotificationsDropdown from './components/NotificationsDropdown';

function MainApp() {
  const socket = useSocket();
  const { user } = useContext(UserContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('nueva_notificacion', (payload) => {
      toast.info(payload.mensaje, { position: 'top-right', autoClose: 5000 });
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.off('nueva_notificacion');
    };
  }, [socket]);

  const headerContent = (
    <NotificationsDropdown
      unreadCount={unreadCount}
      onClear={() => setUnreadCount(0)}
    />
  );

  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard protegido */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout extraHeaderContent={headerContent}>
                <DashboardHome />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Cotizaciones */}
        <Route
          path="/dashboard/nueva-cotizacion"
          element={
            <ProtectedRoute>
              <DashboardLayout extraHeaderContent={headerContent}>
                <NuevaCotizacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/cotizacion/:id/historial"
          element={
            <ProtectedRoute>
              <DashboardLayout extraHeaderContent={headerContent}>
                <HistorialCambios />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/editar-cotizacion/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout extraHeaderContent={headerContent}>
                <EditCotizacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/cotizacion/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout extraHeaderContent={headerContent}>
                <VerCotizacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Selección de registros */}
        <Route
          path="/dashboard/registro-seleccion"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroSeleccion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Plantas */}
        <Route
          path="/dashboard/registro/planta"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroPlanta />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/plantas"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoPlantas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/planta/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroPlanta />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Clientes */}
        <Route
          path="/dashboard/registro/cliente"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroCliente />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/clientes"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoClientes />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/cliente/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroCliente />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Usuarios */}
        <Route
          path="/dashboard/registro/usuario"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroUsuario />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/usuarios"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoUsuarios />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/usuario/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroUsuario />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Materiales */}
        <Route
          path="/dashboard/registro/material"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroMaterial />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/materiales"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoMateriales />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/material/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroMaterial />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Categorías */}
        <Route
          path="/dashboard/registro/categoria"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroCategoria />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/categorias"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoCategorias />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/categoria/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroCategoria />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Proveedores */}
        <Route
          path="/dashboard/registro/proveedor"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroProveedor />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/proveedores"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoProveedores />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/proveedor/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroProveedor />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Contactos Proveedor */}
        <Route
          path="/dashboard/registro/contactos"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ContactosProveedor />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Máquinas */}
        <Route
          path="/dashboard/registro/maquina"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroMaquina />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/maquinas"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <ListadoMaquinas />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/registro/maquina/:id"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <RegistroMaquina />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Solicitudes de aprobación */}
        <Route
          path="/dashboard/solicitudes-aprobacion"
          element={
            <ProtectedRoute allowedRoles={['administrador', 'director']}>
              <DashboardLayout extraHeaderContent={headerContent}>
                <SolicitudesAprobacion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Búsqueda global */}
        <Route
          path="/dashboard/buscar-proyectos"
          element={
            <ProtectedRoute>
              <DashboardLayout extraHeaderContent={headerContent}>
                <SearchGlobal />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </UserProvider>
  );
}

export default App;
