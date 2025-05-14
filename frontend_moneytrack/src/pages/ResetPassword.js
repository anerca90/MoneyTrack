import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError('⚠️ Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.90:8000/api/reset-password/${id}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✅ Contraseña actualizada correctamente');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('alertasNuevas');
          sessionStorage.clear();
          window.location.href = '/';
        }, 2000);
      } else {
        setError(data.error || '❌ No se pudo actualizar la contraseña');
      }
    } catch {
      setError('❌ Error de conexión con el servidor');
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <button className="reset-back" onClick={() => navigate('/')}> 
          <FaArrowLeft className="back-icon" /> Volver al inicio
        </button>

        <h2 className="reset-title">Nueva Contraseña</h2>
        <form onSubmit={handleSubmit} className="reset-form">

          {/* Campo 1: CON ícono */}
          <div className="input-wrapper with-icon">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="reset-input"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Campo 2: CON ícono */}
          <div className="input-wrapper with-icon">
            <input
              type={showRepeatPassword ? 'text' : 'password'}
              placeholder="Repetir contraseña"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className="reset-input"
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowRepeatPassword(!showRepeatPassword)}
            >
              {showRepeatPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="reset-button">Guardar</button>
        </form>

        {error && <p className="reset-error">{error}</p>}
        {success && <p className="reset-success">{success}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
