import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://192.168.1.90:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: email, 
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);
        navigate('/dashboard');
        window.location.reload(); // 🔁 Fuerza recarga para asegurar que se carguen las categorías
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }
    
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Columna izquierda */}
        <div style={styles.leftPanel}>
          <h2 style={styles.title}>¡Bienvenido a MoneyTrack!</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="username"
              placeholder="Nombre de usuario"
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
            <button type="submit" style={styles.button}>Iniciar sesión</button>
            <Link to="/register" style={styles.link}>¿No tienes cuenta? Regístrate</Link>
            <Link to="#" style={styles.forgot}>Olvidé mi contraseña</Link>
            <hr style={styles.hr} />
          </form>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        </div>

        {/* Columna derecha */}
        <div style={styles.rightPanel}>
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

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  card: {
    width: '800px',
    height: '500px',
    display: 'flex',
    borderRadius: '15px',
    boxShadow: '0 0 15px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1,
    padding: '40px',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#1976d2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#1976d2',
    fontSize: '28px',
    marginBottom: '25px',
    textAlign: 'center'
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
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  link: {
    textDecoration: 'none',
    fontSize: '14px',
    color: '#9b4de0',
    textAlign: 'center'
  },
  forgot: {
    fontSize: '12px',
    color: '#666',
    textDecoration: 'underline',
    marginTop: '-10px',
    textAlign: 'center'
  },
  hr: {
    margin: '15px 0',
    border: 'none',
    borderTop: '1px solid #eee',
  }
};

export default Login;
