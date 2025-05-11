import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css'; // Importa tu hoja de estilos

function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://192.168.1.90:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
        window.location.reload();
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Columna izquierda */}
        <div className="login-left">
          <h2 className="login-title">¡Bienvenido a MoneyTrack!</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
            <button type="submit" className="login-button">
              Iniciar sesión
            </button>
            <Link to="/register" className="login-link">
              ¿No tienes cuenta? Regístrate
            </Link>
            <Link to="#" className="login-forgot">
              Olvidé mi contraseña
            </Link>
            <hr className="login-hr" />
          </form>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        </div>

        {/* Columna derecha */}
        <div className="login-right">
          <img src="/logo.png" alt="Logo" width="180" />
          <h2 style={{ color: 'white' }}>Gastos Diarios</h2>
          <p style={{ color: 'white', maxWidth: '200px', textAlign: 'center' }}>
            Controla tus finanzas con MoneyTrack.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
