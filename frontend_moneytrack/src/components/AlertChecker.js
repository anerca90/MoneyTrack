import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Toast.css';

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
  const [toastMessage, setToastMessage] = useState('');

  const verificarAlertas = async () => {
    try {
      console.log('🔄 Verificando alertas...');
      const [alertsRes, transactionsRes] = await Promise.all([
        getAxios().get('alerts/'),
        getAxios().get('transactions/')
      ]);

      const alerts = alertsRes.data;
      const transactions = transactionsRes.data;

      console.log('📦 Transacciones recibidas:', transactions);

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

        console.log(`🔍 Revisando alerta ${alerta.id} — ${porcentaje.toFixed(1)}% del límite`);

        const yaMostrada = sessionStorage.getItem(`alert-${alerta.id}`);

        if (
          alerta.tipo === 'popup' &&
          porcentaje >= 100 &&
          alerta.activa &&
          !yaMostrada
        ) {
          const mensaje = `⚠️ Has superado el límite de $${parseFloat(alerta.limite).toLocaleString()}`;
          setToastMessage(mensaje);
          sessionStorage.setItem(`alert-${alerta.id}`, 'true');

          const existentes = JSON.parse(localStorage.getItem('alertasNuevas') || '[]');
          if (!existentes.some(a => a.id === alerta.id)) {
            const nuevas = [...existentes, { id: alerta.id, mensaje, timestamp: Date.now() }];
            localStorage.setItem('alertasNuevas', JSON.stringify(nuevas));
            window.dispatchEvent(new CustomEvent('alerta-nueva'));
            console.log('🚨 Alerta activada y notificada');
          }

          setTimeout(() => setToastMessage(''), 5000);
        }
      });
    } catch (err) {
      console.error('❌ Error en AlertChecker:', err);
    }
  };

  useEffect(() => {
    verificarAlertas(); // primera llamada
    const interval = setInterval(verificarAlertas, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {toastMessage && (
        <div className="toast-alert">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default AlertChecker;
