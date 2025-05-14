// ✅ Goals.js — profesionalizado con resumen de aportes, accesibilidad y headers corregidos
import React, { useState, useEffect } from 'react';
import GoalModal from './GoalModal';
import '../styles/Goals.css';

function Goals() {
  const [goalTypeOptions, setGoalTypeOptions] = useState([
    'Casa 🏠', 'Auto 🚗', 'Vacaciones 🌴', 'Fondo de Emergencia 💼', 'Estudio 🎓', 'Otros'
  ]);
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Carga inicial de metas y opciones de tipo desde localStorage y API
  useEffect(() => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${localStorage.getItem('token')}`
    };

    const savedOptions = JSON.parse(localStorage.getItem('goalTypeOptions'));
    if (savedOptions) setGoalTypeOptions(savedOptions);

    fetch('http://192.168.1.90:8000/api/goals/', { headers })
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(err => console.error('Error al cargar metas:', err));
  }, []);

  const abrirNuevaMeta = () => {
    setSelectedGoal(null);
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirEdicion = (meta) => {
    setSelectedGoal(meta);
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const actualizarMetas = () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Token ${localStorage.getItem('token')}`
    };

    fetch('http://192.168.1.90:8000/api/goals/', { headers })
      .then(res => res.json())
      .then(data => setGoals(data));
  };

  return (
    <div className="goals-container">
      <h2 className="goals-title">
        <span role="img" aria-label="Metas">🎯</span> Metas de Ahorro
      </h2>

      <div className="acciones-top">
        <button onClick={abrirNuevaMeta} className="button nueva-meta desktop-only">+ Nueva Meta</button>
      </div>

      <button onClick={abrirNuevaMeta} className="fab mobile-only">+ Nueva Meta</button>

      <div className="goals-list">
        {goals.map((goal, index) => {
          const saved = goal.contributions?.reduce((acc, c) => acc + parseFloat(c.amount), 0) || 0;
          const total = parseFloat(goal.monto);
          const percent = total ? Math.min((saved / total) * 100, 100) : 0;
          const ultimosAportes = goal.contributions?.slice(-2).reverse() || [];

          return (
            <div key={index} className="goal-card">
              <div className="goal-header">
                <span className="goal-icon">{goal.tipo}</span>
              </div>
              <div className="goal-body">
                <p><strong>Monto:</strong> ${total.toLocaleString()}</p>
                <p><strong>Ahorrado:</strong> ${saved.toLocaleString()}</p>
                <p><strong>Faltante:</strong> ${(total - saved).toLocaleString()}</p>
                <p><strong>Fecha límite:</strong> {goal.fecha}</p>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${percent}%`,
                      backgroundColor:
                        percent >= 100 ? '#2ecc71' :
                        percent >= 50 ? '#f1c40f' : '#e74c3c'
                    }}
                  />
                </div>
                <p className="progress-text">{Math.round(percent)}% completado</p>

                {ultimosAportes.length > 0 && (
                  <div className="ultimos-aportes">
                    <p><strong>Aportes recientes:</strong></p>
                    <ul>
                      {ultimosAportes.map((a, i) => (
                        <li key={i}>
                          <span role="img" aria-label="Fecha">📅</span> {a.date} — 
                          <span role="img" aria-label="Dinero">💰</span> ${parseFloat(a.amount).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="goal-actions">
                  <button className="button small" onClick={() => abrirEdicion(goal)}>Seleccionar</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalAbierto && (
        <GoalModal
          goal={selectedGoal}
          cerrarModal={() => setModalAbierto(false)}
          onActualizar={actualizarMetas}
          goalTypeOptions={goalTypeOptions}
          setGoalTypeOptions={setGoalTypeOptions}
          modoEdicion={modoEdicion}
        />
      )}
    </div>
  );
}

export default Goals;
