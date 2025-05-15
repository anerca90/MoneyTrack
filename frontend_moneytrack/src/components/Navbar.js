import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars, FaSignOutAlt, FaChartPie, FaClipboardList,
  FaBullseye, FaBell, FaCog, FaUsers
} from 'react-icons/fa';
import '../styles/Navbar.css';
import logo from '../assets/moneytrack-logo.svg';

function Navbar({ collapsed, setCollapsed, swipeHandlers }) {
  const sidebarRef = useRef(null);
  const intervalRef = useRef(null);
  const [nuevasAlertas, setNuevasAlertas] = useState(0);
  const [animar, setAnimar] = useState(false);
  const [username, setUsername] = useState('Usuario');
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener usuario actual
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://192.168.1.90:8000/api/current_user/', {
      headers: { Authorization: `Token ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.username) setUsername(data.username);
      });
  }, []);

  // Revisar alertas nuevas cada 5 segundos o por evento
  useEffect(() => {
    const revisarAlertas = () => {
      const almacenadas = JSON.parse(localStorage.getItem('alertasNuevas') || '[]');
      const recientes = almacenadas.filter(a => Date.now() - a.timestamp < 5 * 60 * 1000);
      const cantidad = recientes.length;

      setNuevasAlertas(cantidad);
      if (cantidad > 0) {
        setAnimar(true);
        setTimeout(() => setAnimar(false), 500);
      }
    };

    revisarAlertas(); // Primera vez

    intervalRef.current = setInterval(revisarAlertas, 5000);
    window.addEventListener('alerta-nueva', revisarAlertas);
    window.addEventListener('storage', revisarAlertas);

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('alerta-nueva', revisarAlertas);
      window.removeEventListener('storage', revisarAlertas);
    };
  }, []); // <-- solo una vez, no depende de nuevasAlertas

  // Al entrar a /alerts, limpiar notificación
  useEffect(() => {
    if (location.pathname === '/alerts') {
      setNuevasAlertas(0);
      localStorage.removeItem('alertasNuevas');
      window.dispatchEvent(new CustomEvent('alerta-nueva'));
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCollapsed(true);
    navigate('/');
  };

  const avatarURL = `https://robohash.org/${username}.png?size=100x100`;

  return (
    <>
      {localStorage.getItem('token') && collapsed && (
        <div className="mobile-hamburger force-show" onClick={() => setCollapsed(false)}>
          <FaBars />
        </div>
      )}

      {!collapsed && <div className="mobile-backdrop" onClick={() => setCollapsed(true)}></div>}

      <div {...swipeHandlers} className={`navbar-sidebar ${collapsed ? 'collapsed' : ''}`} ref={sidebarRef}>
        <div className="navbar-header">
          <img src={logo} alt="MoneyTrack Logo" className="navbar-logo" />
        </div>

        <div className="navbar-user">
          <img src={avatarURL} alt="avatar" className="navbar-avatar" />
          <span className="navbar-username">{username}</span>
        </div>

        <nav className="navbar-links">
          <Link to="/dashboard" className="navbar-link"><FaChartPie className="navbar-icon" /> <span className="navbar-label">Dashboard</span></Link>
          <Link to="/transactions" className="navbar-link"><FaClipboardList className="navbar-icon" /> <span className="navbar-label">Transacciones</span></Link>
          <Link to="/categories" className="navbar-link"><FaBullseye className="navbar-icon" /> <span className="navbar-label">Categorías</span></Link>
          <Link to="/goals" className="navbar-link"><FaCog className="navbar-icon" /> <span className="navbar-label">Metas</span></Link>
          
          <Link to="/alerts" className="navbar-link">
            <div className="navbar-icon-wrapper">
              <FaBell className={`navbar-icon ${nuevasAlertas > 0 ? 'notificacion-activa' : ''}`} />
              {nuevasAlertas > 0 && (
                <span className={`notificacion-badge ${animar ? 'bounce' : ''}`} title={`${nuevasAlertas} alerta(s)`}>
                  {nuevasAlertas}
                </span>
              )}
            </div>
            <span className="navbar-label">Alertas</span>
          </Link>

          {username === 'admin1' && (
            <>
              <div className="navbar-divider" />
              <Link to="/master" className="navbar-link">
                <FaUsers className="navbar-icon" />
                <span className="navbar-label">Usuarios</span>
              </Link>
            </>
          )}
        </nav>

        <div className="navbar-footer">
          <button onClick={handleLogout} className="navbar-link logout-button">
            <FaSignOutAlt className="navbar-icon" />
            <span className="navbar-label">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
