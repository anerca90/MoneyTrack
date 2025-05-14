import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/RecoverPassword.css';

function RecoverPassword() {
  const [userOrEmail, setUserOrEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('alertasNuevas');
    sessionStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://192.168.1.90:8000/api/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_or_email: userOrEmail })
      });

      const data = await res.json();
      if (res.ok) {
        setMensaje('Correo de recuperación enviado');
        setEnviado(true);
      } else {
        setMensaje(data.error || 'No se pudo procesar la solicitud');
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    }
  };

  return (
    <div className="recover-container">
      <div className="recover-card">
        <div className="recover-back" onClick={() => navigate('/')}>
          <FaArrowLeft style={{ marginRight: '6px' }} />
          Volver al inicio
        </div>

        <h2 className="recover-title">Recuperar Contraseña</h2>
        <form onSubmit={handleSubmit} className="recover-form">
          <input
            type="text"
            placeholder="Usuario o correo"
            value={userOrEmail}
            onChange={(e) => setUserOrEmail(e.target.value)}
            className="recover-input"
            required
          />
          <button type="submit" className="recover-button">
            Enviar enlace de recuperación
          </button>
        </form>

        {mensaje && (
          <p className={`recover-message ${enviado ? 'success' : 'error'}`}>
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
}

export default RecoverPassword;
