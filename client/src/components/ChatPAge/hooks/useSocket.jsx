import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      auth: {
        token: document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]
      }
    });

    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return socket;
};

export default useSocket;
