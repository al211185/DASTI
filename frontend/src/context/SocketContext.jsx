// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const lsToken = localStorage.getItem('authToken');
    const rawCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='));
    const cookieToken = rawCookie ? rawCookie.split('=')[1] : null;
    const token = lsToken || cookieToken;
    if (!token) return;

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    s.on('connect_error', (err) => {
      console.error('Socket.IO connect error:', err.message);
    });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  return useContext(SocketContext);
};
