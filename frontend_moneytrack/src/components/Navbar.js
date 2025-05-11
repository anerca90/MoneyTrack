import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBars, FaSignOutAlt, FaChartPie, FaClipboardList,
  FaBullseye, FaBell, FaCog
} from 'react-icons/fa';
import '../styles/Navbar.css'; // ✅ Importar CSS externo

function Navbar({ collapsed, setCollapsed }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setCollapsed]);

  return (
    <div
      className={`navbar-sidebar ${collapsed ? 'collapsed' : ''}`}
      ref={sidebarRef}
    >
      <div className="navbar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <FaBars />
      </div>
      <Link to="/dashboard" className="navbar-link">
        <FaChartPie className="navbar-icon" />
        <span className="navbar-label">Dashboard</span>
      </Link>
      <Link to="/transactions" className="navbar-link">
        <FaClipboardList className="navbar-icon" />
        <span className="navbar-label">Transacciones</span>
      </Link>
      <Link to="/categories" className="navbar-link">
        <FaBullseye className="navbar-icon" />
        <span className="navbar-label">Categorías</span>
      </Link>
      <Link to="/goals" className="navbar-link">
        <FaCog className="navbar-icon" />
        <span className="navbar-label">Metas</span>
      </Link>
      <Link to="/alerts" className="navbar-link">
        <FaBell className="navbar-icon" />
        <span className="navbar-label">Alertas</span>
      </Link>
      <Link to="/logout" className="navbar-link">
        <FaSignOutAlt className="navbar-icon" />
        <span className="navbar-label">Cerrar sesión</span>
      </Link>
    </div>
  );
}

export default Navbar;
