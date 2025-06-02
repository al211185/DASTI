// src/components/NotificationsDropdown.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import axiosInstance from '../api/axiosInstance';
import { UserContext } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationsDropdown = () => {
  const { user } = useContext(UserContext);
  const socket = useSocket();

  // Nuestro hook que devuelve: { notifications, setNotifications, loading }
  const { notifications, setNotifications, loading } = useNotifications();

  // Visible = si el dropdown está abierto o no
  const [visible, setVisible] = useState(false);

  // Número de no leídas: recalculado cada vez que cambia `notifications`
  const unreadCount = React.useMemo(
    () => notifications.filter(n => !n.leida).length,
    [notifications]
  );

  // Al hacer clic en la campana
  const toggleDropdown = () => {
    setVisible(v => !v);
    // (Opcional: podrías, aquí, marcar todas como leídas, por ejemplo)
  };

  // Marcar una notificación concreta como leída
  const marcarLeida = async (id) => {
    try {
      await axiosInstance.patch(`/notificaciones/${id}`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

  // **Aquí suscribimos el socket para recibir “nueva_notificacion”**
  useEffect(() => {
    if (!socket) return;

    const handleNuevaNoti = (payload) => {
      // Insertamos la nueva notificación al principio del array
      setNotifications(prev => [
        { ...payload, leida: false },
        ...prev
      ]);

      // Opcional: mostramos un toast para avisar al usuario
      toast.info(payload.mensaje, {
        position: 'top-right',
        autoClose: 4000
      });
    };

    socket.on('nueva_notificacion', handleNuevaNoti);
    return () => {
      socket.off('nueva_notificacion', handleNuevaNoti);
    };
  }, [socket, setNotifications]);

  return (
    <div className="relative inline-block text-left">
      <button onClick={toggleDropdown} className="flex items-center focus:outline-none">
        <span className="material-icons">notifications</span>
        {unreadCount > 0 && (
          <span className="ml-1 bg-red-500 text-white rounded-full px-2 text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {visible && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-2 border-b font-semibold">Notificaciones</div>
          {loading ? (
            <div className="p-4 text-center">Cargando…</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Sin notificaciones</div>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {notifications.map(noti => (
                <li
                  key={noti._id}
                  className={`p-2 flex justify-between items-start space-x-2 ${
                    noti.leida ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100`}
                >
                  <div className="flex-1">
                    <p className={`${noti.leida ? 'text-gray-500' : 'font-medium'}`}>
                      {noti.mensaje}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(noti.fecha).toLocaleString()}
                    </span>
                  </div>
                  {!noti.leida && (
                    <button
                      className="text-blue-500 text-sm"
                      onClick={() => marcarLeida(noti._id)}
                    >
                      Marcar leída
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
