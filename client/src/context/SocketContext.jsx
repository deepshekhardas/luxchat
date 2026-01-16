import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Connect to Socket server
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket Connected:', newSocket.id);
      });

      newSocket.on('user.online', (data) => {
        console.log('User Online:', data);
        // Logic to update online list users
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user, socket]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
