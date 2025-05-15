import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import EditAlertModal from './EditAlertModal';
import '../styles/Alerts.css';

const getAxios = () => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: 'http://192.168.1.90:8000/api/',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    limite: '',
    tipo: 'popup',
    activa: true
  });

  const [mensajeAlerta, setMensajeAlerta] = useState('null');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const alertaCerradaRef = useRef({});

  useEffect(() => {
  getAxios().get('alerts/')
    .then(res => setAlerts(res.data));
  getAxios().get('transactions/')
    .then(res => setTransactions(res.data));
}, []);

  const calcularPorcentaje = useCallback((alerta) => {
    if (!alerta || !alerta.limite) return 0;
    const inicio = new Date(alerta.fecha_inicio);
    const fin = new Date(alerta.fecha_fin);
    const gastos = transactions.filter(t =>
      t.type === 'expense' &&
      new Date(t.date) >= inicio &&
      new Date(t.date) <= fin
    );
    const total = gastos.reduce((acc, t) => acc + parseFloat(t.actual || 0), 0);
    return Math.min((total / parseFloat(alerta.limite)) * 100, 100);
  }, [transactions]);

  useEffect(() => {
    const verificarAlertas = () => {
      alerts.forEach(alerta => {
        const porcentaje = calcularPorcentaje(alerta);

        if (alerta.tipo === 'popup' && porcentaje >= 100 && alerta.activa) {
          if (!alertaCerradaRef.current[alerta.id]) {
            const mensaje = `⚠️ Has superado el límite de $${parseFloat(alerta.limite).toLocaleString()}`;
            setMensajeAlerta({ id: alerta.id, mensaje });

            const existentes = JSON.parse(localStorage.getItem('alertasNuevas') || '[]');
            if (!existentes.some(a => a.id === alerta.id)) {
              const nuevas = [...existentes, { id: alerta.id, mensaje, timestamp: Date.now() }];
              localStorage.setItem('alertasNuevas', JSON.stringify(nuevas));
              window.dispatchEvent(new CustomEvent('alerta-nueva'));
            }
          }
        }
      });
    };

    verificarAlertas(); // Primera llamada inmediata
    const interval = setInterval(verificarAlertas, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [alerts, transactions, calcularPorcentaje]);



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const guardarAlerta = (e) => {
    e.preventDefault();
    const { fecha_inicio, fecha_fin } = formData;
    if (new Date(fecha_inicio) > new Date(fecha_fin)) {
      return alert('La fecha de inicio debe ser anterior a la de fin.');
    }

    getAxios().post('alerts/', formData)
      .then(res => {
        setAlerts([...alerts, res.data]);
        setFormData({
          nombre: '',
          fecha_inicio: '',
          fecha_fin: '',
          limite: '',
          tipo: 'popup',
          activa: true
        });
      });
  };

  const eliminarAlerta = (id) => {
    getAxios().delete(`alerts/${id}/`)
      .then(() => {
        setAlerts(alerts.filter(a => a.id !== id));
      });
  };

  const toggleEstadoAlerta = (id, estado) => {
    getAxios().patch(`alerts/${id}/`, { activa: estado })
      .then(() => {
        setAlerts(alerts.map(a => a.id === id ? { ...a, activa: estado } : a));
      });
  };

  const abrirModalEdicion = useCallback((alerta) => {
    setSelectedAlert(alerta);
    setEditModalOpen(true);
  }, []);

  const getBarColor = (percent) => {
    if (percent >= 100) return '#e74c3c';
    if (percent >= 80) return '#f1c40f';
    return '#2ecc71';
  };

  return (
    <div className="alerts-container">
      {mensajeAlerta?.mensaje && (
        <div className="alert-banner">
          <span className="alert-text">{mensajeAlerta.mensaje}</span>
          <button
            className="close-button"
            onClick={() => {
              setMensajeAlerta(null);
              // 🔄 Eliminar alerta del localStorage
              const almacenadas = JSON.parse(localStorage.getItem('alertasNuevas') || '[]');
              const filtradas = almacenadas.filter(a => a.id !== mensajeAlerta.id);
              localStorage.setItem('alertasNuevas', JSON.stringify(filtradas));
              window.dispatchEvent(new CustomEvent('alerta-nueva'));
            }}
          >
            ✖
          </button>
        </div>
      )}

      <h2 className="alerts-title">
        <span role="img" aria-label="alerta">🔔</span> Gestión de Alertas
      </h2>

      <form className="alert-form" onSubmit={guardarAlerta}>
        <input type="text" name="nombre" placeholder="Nombre de la alerta" value={formData.nombre} onChange={handleInputChange} required />

        <div className="form-group">
          <label className="label">Rango de fechas para la alerta</label>
          <div className="input-group">
            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} required />
            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleInputChange} required />
          </div>
        </div>

        <input
          type="text"
          name="limite"
          placeholder="Ingrese monto de la alerta"
          value={formData.limite ? Number(formData.limite).toLocaleString() : ''}
          onChange={(e) => setFormData(prev => ({ ...prev, limite: e.target.value.replace(/\D/g, '') }))}
          required
        />

        <div className="form-group">
          <label className="label">Estado de la alerta</label>
          <div className="switch-container">
            <label className="switch">
              <input type="checkbox" name="activa" checked={formData.activa} onChange={handleInputChange} />
              <span className="slider"></span>
            </label>
            <span className="switch-label">{formData.activa ? 'Activa' : 'Inactiva'}</span>
          </div>
        </div>

        <button type="submit" className="button">Guardar</button>
      </form>
            <div className="alertes-grid">
        {alerts.map(a => {
          const porcentaje = calcularPorcentaje(a);
          const total = transactions.filter(t =>
            t.type === 'expense' &&
            new Date(t.date) >= new Date(a.fecha_inicio) &&
            new Date(t.date) <= new Date(a.fecha_fin)
          ).reduce((acc, t) => acc + parseFloat(t.actual || 0), 0);
          const restante = parseFloat(a.limite) - total;
          const diasRestantes = Math.ceil((new Date(a.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24));

          return (
            <div key={a.id} className="alert-card">
              <h3>{a.nombre ? `Alerta: ${a.nombre}` : `Alerta #${a.id}`}</h3>
              <p><strong>Periodo:</strong> {a.fecha_inicio} a {a.fecha_fin}</p>
              <p><strong>Duración:</strong> {Math.ceil((new Date(a.fecha_fin) - new Date(a.fecha_inicio)) / (1000 * 60 * 60 * 24)) + 1} días</p>
              {diasRestantes <= 3 && diasRestantes >= 0 && (
                <p style={{ color: '#e67e22', fontWeight: 'bold' }}>
                  <span role="img" aria-label="advertencia">⚠️</span> Quedan {diasRestantes} días
                </p>
              )}
              <p><strong>Límite:</strong> ${parseFloat(a.limite).toLocaleString()}</p>
              <p><strong>Gastado:</strong> ${total.toLocaleString()}</p>
              <p><strong>Restante:</strong> ${restante > 0 ? restante.toLocaleString() : 0}</p>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${porcentaje}%`, backgroundColor: getBarColor(porcentaje) }}
                />
              </div>
              <p className="porcentaje-text">{porcentaje.toFixed(1)}% usado</p>

              <div className="alert-buttons">
                <button className="button small" onClick={() => abrirModalEdicion(a)}>Editar</button>
                <button className="button small red" onClick={() => eliminarAlerta(a.id)}>Eliminar</button>
              </div>

              <div className="alert-status">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={a.activa}
                    onChange={() => toggleEstadoAlerta(a.id, !a.activa)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="switch-label">{a.activa ? 'Activa' : 'Inactiva'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {editModalOpen && selectedAlert && (
        <EditAlertModal
          alerta={selectedAlert}
          onClose={() => setEditModalOpen(false)}
          onUpdated={(actualizada) => {
            setAlerts(alerts.map(a => a.id === actualizada.id ? actualizada : a));
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Alerts;

