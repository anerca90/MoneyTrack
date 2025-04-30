import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ setIsAuthenticated }) {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    navigate('/');
  }, [navigate, setIsAuthenticated]);

  return null;
}

export default Logout;
