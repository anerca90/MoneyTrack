import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(null);

    try {
      const response = await fetch('http://192.168.1.90:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Usuario registrado correctamente');
        setIsSuccess(true);
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('alertasNuevas');
          sessionStorage.clear();
          window.location.href = '/';
        }, 2000);
      } else {
        setMessage(data.error || '❌ Error al registrar');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('⚠️ Error de conexión con el servidor');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-back" onClick={() => navigate('/')}>
          <FaArrowLeft className="back-icon" />
          Volver al inicio
        </div>

        <h2 className="register-title">Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="register-input"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="register-input"
            required
          />
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? (
              <span className="loading-content">
                <span className="spinner" /> Registrando...
              </span>
            ) : (
              'Registrarse'
            )}
          </button>
        </form>

        {message && (
          <p className={`register-message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Register;
