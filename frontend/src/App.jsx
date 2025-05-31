import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard protegido */}
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

        {/* Cotizaciones */}
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
          path="/dashboard/cotizacion/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
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
              <DashboardLayout>
                <RegistroSeleccion />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Plantas, clientes, usuarios */}
        <Route path="/dashboard/registro/planta" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroPlanta /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/GESTIONAR plantas */}
        <Route path="/dashboard/registro/plantas" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><ListadoPlantas /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de una planta concreta */}
        <Route path="/dashboard/registro/planta/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroPlanta /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/registro/cliente" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroCliente /></DashboardLayout>
          </ProtectedRoute>
        } />
        {/* ← Aquí: ruta para LISTAR/GESTIONAR clientes */}
        <Route path="/dashboard/registro/clientes" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><ListadoClientes /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de un cliente concreto */}
        <Route path="/dashboard/registro/cliente/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroCliente /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/registro/usuario" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroUsuario /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/GESTIONAR usuarios */}
        <Route path="/dashboard/registro/usuarios" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><ListadoUsuarios /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de un cliente concreto */}
        <Route path="/dashboard/registro/usuario/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroUsuario /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Materiales: crear, listar/gestionar y editar */}
        <Route path="/dashboard/registro/material" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><RegistroMaterial /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/GESTIONAR materiales */}
        <Route path="/dashboard/registro/materiales" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><ListadoMateriales /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de un material concreto */}
        <Route path="/dashboard/registro/material/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><RegistroMaterial /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Categorías, proveedores, máquinas */}
        <Route path="/dashboard/registro/categoria" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><RegistroCategoria /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/GESTIONAR categorias */}
        <Route path="/dashboard/registro/categorias" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><ListadoCategorias /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de una categoria concreta */}
        <Route path="/dashboard/registro/categoria/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><RegistroCategoria /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/registro/proveedor" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><RegistroProveedor /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/GESTIONAR proveedores */}
        <Route path="/dashboard/registro/proveedores" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><ListadoProveedores /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de una categoria concreta */}
        <Route path="/dashboard/registro/proveedor/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director', 'almacen', 'compras']}>
            <DashboardLayout><RegistroProveedor /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/VER contactos de proveedores */}
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


        <Route path="/dashboard/registro/maquina" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroMaquina /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ← Aquí: ruta para LISTAR/GESTIONAR maquinas */}
        <Route path="/dashboard/registro/maquinas" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><ListadoMaquinas /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Edición de una maquina concreta */}
        <Route path="/dashboard/registro/maquina/:id" element={
          <ProtectedRoute allowedRoles={['administrador', 'director']}>
            <DashboardLayout><RegistroMaquina /></DashboardLayout>
          </ProtectedRoute>
        } />

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

        {/* Búsqueda global */}
        <Route path="/dashboard/buscar-proyectos" element={
          <ProtectedRoute>
            <DashboardLayout><SearchGlobal /></DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
