// src/components/Dashboard/Usuarios/RegistroUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';

export default function RegistroUsuario() {
  const { id } = useParams();           // si existe → modo edición
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    empleadoID: '',
    departamento: '',
    rol: '',
  });
  const [roles, setRoles]     = useState([]);
  const [error, setError]     = useState(null);
  const [guardando, setGuardando] = useState(false);

  // 1) Carga roles
  useEffect(() => {
    axiosInstance.get('/roles')
      .then(res => setRoles(res.data))
      .catch(err => console.error('Error al obtener roles:', err));
  }, []);

  // 2) Si hay id, carga el usuario
  useEffect(() => {
    if (!id) return;
    axiosInstance.get(`/user/${id}`)
      .then(res => {
        // no pre‑llenamos password
        const { password, ...rest } = res.data;
        setUserData({ ...rest, password: '' });
      })
      .catch(err => {
        console.error('Error al cargar usuario:', err);
        alert('No se pudo cargar el usuario');
        navigate(-1);
      });
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      const payload = { ...userData };
      // en edición, si no metió nueva pass, la quitamos
      if (id && !payload.password) delete payload.password;

      if (id) {
        await axiosInstance.put(`/user/${id}`, payload);
      } else {
        await axiosInstance.post('/user', payload);
      }
      navigate('/dashboard/usuarios');
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(err.response?.data?.msg || 'Error al guardar usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {id ? 'Editar Usuario' : 'Registrar Usuario'}
      </h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          name="nombre"
          value={userData.nombre}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={userData.email}
          onChange={handleChange}
          required
        />
        <Input
          label={id ? 'Nueva Contraseña (dejar vacío si no cambia)' : 'Contraseña'}
          name="password"
          type="password"
          value={userData.password}
          onChange={handleChange}
          required={!id}
        />
        <Input
          label="Teléfono"
          name="telefono"
          value={userData.telefono}
          onChange={handleChange}
        />
        <Input
          label="Empleado ID"
          name="empleadoID"
          value={userData.empleadoID}
          onChange={handleChange}
        />

        <Select
          label="Departamento"
          name="departamento"
          value={userData.departamento}
          onChange={handleChange}
          options={[
            { value: '', label: 'Seleccione Departamento' },
            { value: 'administración', label: 'Administración' },
            { value: 'ventas', label: 'Ventas' },
            { value: 'requisiciones', label: 'Requisiciones' },
            { value: 'diseño', label: 'Diseño' },
            { value: 'producción', label: 'Producción' },
          ]}
          required
        />

        <Select
          label="Rol"
          name="rol"
          value={userData.rol}
          onChange={handleChange}
          options={[{ value: '', label: 'Seleccione Rol' }, ...roles.map(r => ({
            value: r._id, label: r.nombre
          }))]}
          required
        />

        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 disabled:opacity-50 transition"
        >
          {guardando
            ? 'Guardando…'
            : id
              ? 'Actualizar Usuario'
              : 'Registrar Usuario'}
        </button>
      </form>
    </div>
  );
}

// Componentes auxiliares para inputs y selects
const Input = ({ label, name, type = 'text', value, onChange, required }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border rounded p-2"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required }) => (
  <div>
    {label && <label className="block mb-1">{label}</label>}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border rounded p-2"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
