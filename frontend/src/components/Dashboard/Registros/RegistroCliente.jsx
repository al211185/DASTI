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
    // Array de contactos
    contactos: [
      { nombre: '', cargo: '', telefono: '', email: '' }
    ],
    sector: '',
    comentarios: ''
  });

  const navigate = useNavigate();

  // Manejo dinámico de campos de nivel 1 y de objetos anidados en "direccion"
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si viene algo como "direccion.calle", dividimos
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCliente((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCliente((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Manejo específico para los campos de cada contacto en el array "contactos"
  const handleContactoChange = (index, e) => {
    const { name, value } = e.target; // name podría ser "nombre", "cargo", etc.
    setCliente((prev) => {
      const nuevosContactos = [...prev.contactos];
      nuevosContactos[index][name] = value;
      return { ...prev, contactos: nuevosContactos };
    });
  };

  // Agregar un contacto vacío al array
  const agregarContacto = () => {
    setCliente((prev) => ({
      ...prev,
      contactos: [
        ...prev.contactos,
        { nombre: '', cargo: '', telefono: '', email: '' }
      ]
    }));
  };

  // Eliminar un contacto por su índice
  const eliminarContacto = (index) => {
    setCliente((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((_, i) => i !== index)
    }));
  };

  // Enviar todo el objeto "cliente" al backend
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

        {/* Datos de contacto general */}
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

        {/* Contactos (array) */}
        <fieldset className="border p-4">
          <legend className="px-2">Contactos</legend>
          {cliente.contactos.map((contact, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <div>
                <label className="block mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre del contacto"
                  value={contact.nombre}
                  onChange={(e) => handleContactoChange(index, e)}
                  className="w-full border rounded p-2 mb-2"
                />
              </div>
              <div>
                <label className="block mb-1">Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  placeholder="Cargo"
                  value={contact.cargo}
                  onChange={(e) => handleContactoChange(index, e)}
                  className="w-full border rounded p-2 mb-2"
                />
              </div>
              <div>
                <label className="block mb-1">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  value={contact.telefono}
                  onChange={(e) => handleContactoChange(index, e)}
                  className="w-full border rounded p-2 mb-2"
                />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => handleContactoChange(index, e)}
                  className="w-full border rounded p-2 mb-2"
                />
              </div>

              {cliente.contactos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarContacto(index)}
                  className="text-red-500 underline"
                >
                  Eliminar este contacto
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={agregarContacto}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Agregar otro contacto
          </button>
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
