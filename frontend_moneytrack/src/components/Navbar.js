import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaSignOutAlt, FaChartPie, FaClipboardList, FaBullseye, FaBell, FaCog } from 'react-icons/fa';

function Navbar() {
  const [collapsed, setCollapsed] = useState(false);

  const sidebarStyle = {
    height: '100vh',
    width: collapsed ? '60px' : '220px',
    background: '#2c3e50',
    color: 'white',
    paddingTop: '20px',
    position: 'fixed',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    zIndex: 1000
  };

  const toggleStyle = {
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '20px',
    marginBottom: '20px'
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: 'white',
    textDecoration: 'none',
    transition: 'background 0.2s',
    whiteSpace: 'nowrap'
  };

  const iconStyle = {
    marginRight: collapsed ? 0 : '10px',
    fontSize: '18px'
  };

  const labelStyle = {
    display: collapsed ? 'none' : 'inline-block'
  };

  return (
    <div style={sidebarStyle}>
      <div style={toggleStyle} onClick={() => setCollapsed(!collapsed)}>
        <FaBars />
      </div>
      <Link to="/dashboard" style={linkStyle}><FaChartPie style={iconStyle} /><span style={labelStyle}>Dashboard</span></Link>
      <Link to="/transactions" style={linkStyle}><FaClipboardList style={iconStyle} /><span style={labelStyle}>Transacciones</span></Link>
      <Link to="/categories" style={linkStyle}><FaBullseye style={iconStyle} /><span style={labelStyle}>Categorías</span></Link>
      <Link to="/goals" style={linkStyle}><FaCog style={iconStyle} /><span style={labelStyle}>Metas</span></Link>
      <Link to="/alerts" style={linkStyle}><FaBell style={iconStyle} /><span style={labelStyle}>Alertas</span></Link>
      <Link to="/logout" style={linkStyle}><FaSignOutAlt style={iconStyle} /><span style={labelStyle}>Cerrar sesión</span></Link>
    </div>
  );
}

export default Navbar;
