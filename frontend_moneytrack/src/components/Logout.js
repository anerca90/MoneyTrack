import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token'); // 👈 elimina token
    setIsAuthenticated(false);        // 👈 cambia estado global
    navigate('/');
  }, [setIsAuthenticated, navigate]);

  return null;
}

export default Logout;