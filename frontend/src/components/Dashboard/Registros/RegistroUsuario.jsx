import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const RegistroUsuario = () => {
  // Estado para los datos del usuario
  const [userData, setUserData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    empleadoID: '',
    departamento: '',
    rol: ''  // guardará el ObjectId del rol seleccionado
  });
  // Estado para almacenar los roles disponibles
  const [roles, setRoles] = useState([]);
  // Estado para manejar errores
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Cargar roles desde el backend en el montaje del componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axiosInstance.get('/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Error al obtener roles:', error);
      }
    };
    fetchRoles();
  }, []);

  // Maneja el cambio de inputs (campo a campo)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Envía los datos del formulario al backend para registrar el usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/user', userData);
      // Redirige a la página principal del dashboard u otra ruta según convenga
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError(err.response?.data?.msg || 'Error al registrar usuario');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrar Usuario</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={userData.nombre}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={userData.password}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={userData.telefono}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <input
          type="text"
          name="empleadoID"
          placeholder="Empleado ID"
          value={userData.empleadoID}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
        <select
          name="departamento"
          value={userData.departamento}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        >
          <option value="">Seleccione Departamento</option>
          <option value="administración">Administración</option>
          <option value="ventas">Ventas</option>
          <option value="requisiciones">Requisiciones</option>
          <option value="diseño">Diseño</option>
          <option value="producción">Producción</option>
        </select>
        <select
          name="rol"
          value={userData.rol}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        >
          <option value="">Seleccione Rol</option>
          {roles.map((role) => (
            <option key={role._id} value={role._id}>
              {role.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition-colors"
        >
          Registrar Usuario
        </button>
      </form>
    </div>
  );
};

export default RegistroUsuario;
