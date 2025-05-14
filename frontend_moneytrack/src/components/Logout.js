import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Elimina el token
    localStorage.removeItem('token');

    // ✅ Marca sidebar como colapsado
    localStorage.setItem('forceCollapse', 'true');

    // ✅ Cambia estado de autenticación
    setIsAuthenticated(false);

    // ✅ Redirige
    navigate('/');
  }, [setIsAuthenticated, navigate]);

  return null;
}

export default Logout;
