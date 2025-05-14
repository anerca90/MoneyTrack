import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

import Navbar from './components/Navbar';
import Logout from './components/Logout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import Goals from './components/Goals';
import Alerts from './components/Alerts';
import AlertChecker from './components/AlertChecker';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Master from './components/Master';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768); // ✅ Móvil: colapsado

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setCollapsed(true),
    onSwipedRight: () => setCollapsed(false),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setCollapsed(false); // ✅ Mostrar en escritorio al redimensionar
      } else {
        setCollapsed(true);  // ✅ Ocultar en móviles
      }
    };

    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);

      if (!token) {
        setCollapsed(true); // ⛔ Cierra el navbar si no hay token
      }

      // Limpia la marca de colapso forzada si existe
      if (localStorage.getItem('forceCollapse')) {
        setCollapsed(true);
        localStorage.removeItem('forceCollapse');
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      {isAuthenticated && (
        <>
          <Navbar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            swipeHandlers={swipeHandlers}
          />
          <AlertChecker />
        </>
      )}

      <div
        {...swipeHandlers}
        style={{
          marginLeft: isAuthenticated && !collapsed ? '180px' : '0',
          padding: '20px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Routes>
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset-password/:id" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/master" element={<Master />} />
          <Route path="/logout" element={<Logout setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
