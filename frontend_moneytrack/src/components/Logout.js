import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Elimina el token de autenticación
    localStorage.removeItem('token');

    // ✅ Actualiza el estado global de autenticación
    setIsAuthenticated(false);

    // ✅ Redirige al login
    navigate('/');
  }, [setIsAuthenticated, navigate]);

  return null; // No muestra contenido
}

export default Logout;
