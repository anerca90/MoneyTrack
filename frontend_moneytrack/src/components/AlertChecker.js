import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Toast.css';
import { useNavigate } from 'react-router-dom';

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

const AlertChecker = () => {
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  const verificarAlertas = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [alertsRes, transactionsRes] = await Promise.all([
        getAxios().get('alerts/'),
        getAxios().get('transactions/')
      ]);

      const alerts = alertsRes.data;
      const transactions = transactionsRes.data;

      alerts.forEach(alerta => {
        const inicio = new Date(alerta.fecha_inicio);
        const fin = new Date(alerta.fecha_fin);
        const gastos = transactions.filter(t =>
          t.type === 'expense' &&
          new Date(t.date) >= inicio &&
          new Date(t.date) <= fin
        );

        const totalGastado = gastos.reduce((acc, t) => acc + parseFloat(t.actual || 0), 0);
        const porcentaje = (totalGastado / parseFloat(alerta.limite || 1)) * 100;

        const ultimaVez = localStorage.getItem(`alert-last-${alerta.id}`);
        const ahora = Date.now();

        const mostrarOtraVez = !ultimaVez || ahora - parseInt(ultimaVez) > 5 * 60 * 1000;

        if (
          alerta.tipo === 'popup' &&
          porcentaje >= 100 &&
          alerta.activa &&
          mostrarOtraVez
        ) {
          const mensaje = `⚠️ Has superado el límite de $${parseFloat(alerta.limite).toLocaleString()}`;
          setToastMessage({ id: alerta.id, mensaje });
          localStorage.setItem(`alert-last-${alerta.id}`, ahora.toString());

          // También activa ícono de campana
          const nuevas = JSON.parse(localStorage.getItem('alertasNuevas') || '[]');
          if (!nuevas.some(a => a.id === alerta.id)) {
            const actualizadas = [...nuevas, { id: alerta.id, mensaje, timestamp: ahora }];
            localStorage.setItem('alertasNuevas', JSON.stringify(actualizadas));
            window.dispatchEvent(new CustomEvent('alerta-nueva'));
          }
        }
      });
    } catch (err) {
      console.error('❌ Error verificando alertas:', err);
    }
  };

  useEffect(() => {
    verificarAlertas();
    const interval = setInterval(verificarAlertas, 5000);

    const detener = () => {
      clearInterval(interval);
      window.removeEventListener('logout-event', detener);
    };

    window.addEventListener('logout-event', detener);
    return detener;
  }, []);

  return (
    <>
      {toastMessage && (
        <div className="toast-alert" onClick={() => navigate('/alerts')}>
          <span className="toast-text">{toastMessage.mensaje}</span>
          <button
            className="close-button"
            onClick={(e) => {
              e.stopPropagation(); // Evita redirección al cerrar
              setToastMessage(null);
            }}
          >
            ✖
          </button>
        </div>
      )}
    </>
  );
};

export default AlertChecker;
