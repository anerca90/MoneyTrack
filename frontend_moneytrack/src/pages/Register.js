import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // 👈 importa ícono de flecha

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://192.168.1.90:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Usuario registrado correctamente');
        setIsSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage(data.error || 'Error al registrar');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor');
      setIsSuccess(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 🔙 Botón Volver */}
        <div style={styles.backButton} onClick={() => navigate('/')}>
          <FaArrowLeft style={{ marginRight: '6px' }} />
          Volver
        </div>

        <h2 style={styles.title}>Crear cuenta</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>Registrarse</button>
        </form>
        {message && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '15px',
              color: isSuccess ? 'green' : 'red',
            }}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  card: {
    width: '400px',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: '#3498db',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#9b4de0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    backgroundColor: '#9b4de0',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Register;

