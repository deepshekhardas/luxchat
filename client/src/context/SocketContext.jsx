import { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Only create socket if not already connected
      if (socketRef.current) {
        return;
      }

      // Connect to Socket server
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002', {
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      newSocket.on('connect', () => {
        console.log('Socket Connected:', newSocket.id);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket Disconnected:', reason);
      });

      newSocket.on('user.online', (data) => {
        console.log('User Online:', data);
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
      };
    } else {
      // User logged out - close socket
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [user]); // Only depend on user, not socket

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
