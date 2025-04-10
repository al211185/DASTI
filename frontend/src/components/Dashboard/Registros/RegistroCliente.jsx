import React, { useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegistroCliente = () => {
  const [cliente, setCliente] = useState({
    nombre: '',
    razonSocial: '',
    direccion: {
      calle: '',
      numero: '',
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: ''
    },
    telefono: '',
    email: '',
    sitioWeb: '',
    contactoPrincipal: {
      nombre: '',
      cargo: '',
      telefono: '',
      email: ''
    },
    sector: '',
    comentarios: ''
  });

  const navigate = useNavigate();

  // Manejo dinámico de campos: si el name contiene un punto, actualiza la propiedad anidada.
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCliente((prevState) => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value
        }
      }));
    } else {
      setCliente((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/clientes', cliente);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al registrar cliente:', error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrar Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Datos generales */}
        <div>
          <label className="block mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={cliente.nombre}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Razón Social</label>
          <input
            type="text"
            name="razonSocial"
            placeholder="Razón Social"
            value={cliente.razonSocial}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Sección de dirección */}
        <fieldset className="border p-4">
          <legend className="px-2">Dirección</legend>
          <div>
            <label className="block mb-1">Calle</label>
            <input
              type="text"
              name="direccion.calle"
              placeholder="Calle"
              value={cliente.direccion.calle}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Número</label>
            <input
              type="text"
              name="direccion.numero"
              placeholder="Número"
              value={cliente.direccion.numero}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Colonia</label>
            <input
              type="text"
              name="direccion.colonia"
              placeholder="Colonia"
              value={cliente.direccion.colonia}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Ciudad</label>
            <input
              type="text"
              name="direccion.ciudad"
              placeholder="Ciudad"
              value={cliente.direccion.ciudad}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Estado</label>
            <input
              type="text"
              name="direccion.estado"
              placeholder="Estado"
              value={cliente.direccion.estado}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Código Postal</label>
            <input
              type="text"
              name="direccion.codigoPostal"
              placeholder="Código Postal"
              value={cliente.direccion.codigoPostal}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </fieldset>

        {/* Datos de contacto */}
        <div>
          <label className="block mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={cliente.telefono}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={cliente.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Sitio Web</label>
          <input
            type="text"
            name="sitioWeb"
            placeholder="Sitio Web"
            value={cliente.sitioWeb}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Datos de contacto principal */}
        <fieldset className="border p-4">
          <legend className="px-2">Contacto Principal</legend>
          <div>
            <label className="block mb-1">Nombre</label>
            <input
              type="text"
              name="contactoPrincipal.nombre"
              placeholder="Nombre"
              value={cliente.contactoPrincipal.nombre}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Cargo</label>
            <input
              type="text"
              name="contactoPrincipal.cargo"
              placeholder="Cargo"
              value={cliente.contactoPrincipal.cargo}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Teléfono</label>
            <input
              type="text"
              name="contactoPrincipal.telefono"
              placeholder="Teléfono"
              value={cliente.contactoPrincipal.telefono}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="contactoPrincipal.email"
              placeholder="Email"
              value={cliente.contactoPrincipal.email}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
        </fieldset>

        {/* Otros datos */}
        <div>
          <label className="block mb-1">Sector</label>
          <input
            type="text"
            name="sector"
            placeholder="Sector"
            value={cliente.sector}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1">Comentarios</label>
          <textarea
            name="comentarios"
            placeholder="Comentarios"
            value={cliente.comentarios}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Registrar Cliente
        </button>
      </form>
    </div>
  );
};

export default RegistroCliente;
