// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const rawCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='));
    const token = rawCookie ? rawCookie.split('=')[1] : null;
    if (!token) return;

    const s = io('http://localhost:5000', {
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
