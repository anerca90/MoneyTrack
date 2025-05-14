import React, { useState, useEffect } from 'react';
import '../styles/GoalModal.css';

function GoalModal({ goal: initialGoal, cerrarModal, onActualizar, goalTypeOptions, setGoalTypeOptions }) {
  const [goal, setGoal] = useState(initialGoal);
  const [modoEdicion, setModoEdicion] = useState(!initialGoal);
  const [tipo, setTipo] = useState(initialGoal?.tipo || '');
  const [monto, setMonto] = useState(initialGoal?.monto || '');
  const [displayMonto, setDisplayMonto] = useState('');
  const [fecha, setFecha] = useState(initialGoal?.fecha || new Date().toISOString().slice(0, 10));
  const [aporte, setAporte] = useState('');
  const [fechaAporte, setFechaAporte] = useState(new Date().toISOString().slice(0, 10));
  const [displayAporte, setDisplayAporte] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`
  };

  useEffect(() => {
    const opcionesGuardadas = JSON.parse(localStorage.getItem('goalTypeOptions'));
    if (opcionesGuardadas) setGoalTypeOptions(opcionesGuardadas);
  }, [setGoalTypeOptions]);

  useEffect(() => {
    if (initialGoal?.monto) {
      const raw = initialGoal.monto.toString().split('.')[0];
      setMonto(raw);
      setDisplayMonto(Number(raw).toLocaleString('es-CL'));
    }
  }, [initialGoal]);

  const guardarMeta = () => {
    const meta = { tipo, monto, fecha };
    const metodo = goal ? 'PUT' : 'POST';
    const url = goal
      ? `http://192.168.1.90:8000/api/goals/${goal.id}/`
      : 'http://192.168.1.90:8000/api/goals/';

    fetch(url, { method: metodo, headers, body: JSON.stringify(meta) })
      .then(() => {
        onActualizar();
        cerrarModal();
      })
      .catch(err => console.error('Error al guardar:', err));
  };

  const eliminarMeta = () => {
    if (!goal) return;
    fetch(`http://192.168.1.90:8000/api/goals/${goal.id}/`, { method: 'DELETE', headers })
      .then(() => {
        onActualizar();
        cerrarModal();
      })
      .catch(err => console.error('Error al eliminar:', err));
  };

  const guardarAporte = (e) => {
    e.preventDefault();
    if (!goal) return;
    const nuevo = {
      goal: goal.id,
      amount: aporte,
      date: fechaAporte
    };
    fetch('http://192.168.1.90:8000/api/contributions/', {
      method: 'POST',
      headers,
      body: JSON.stringify(nuevo)
    })
      .then(res => res.json())
      .then((nuevoAporte) => {
        const nuevas = [...(goal.contributions || []), nuevoAporte];
        const total = nuevas.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
        const porcentaje = Math.min((total / parseFloat(goal.monto)) * 100, 100);
        setGoal({
          ...goal,
          contributions: nuevas,
          progreso: Math.round(porcentaje)
        });
        onActualizar();
        setAporte('');
        setDisplayAporte('');
        setFechaAporte(new Date().toISOString().slice(0, 10));
      })
      .catch(err => console.error('Error al guardar aporte:', err));
  };

  const total = parseFloat(goal?.monto || 0);
  const ahorrado = goal?.contributions?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;
  const porcentaje = total ? Math.min((ahorrado / total) * 100, 100) : 0;
  const colorBarra = porcentaje >= 100 ? '#2ecc71' : porcentaje >= 50 ? '#f1c40f' : '#e74c3c';

  return (
    <div className="goal-modal-overlay">
      <div className={`goal-modal ${!modoEdicion ? 'read-only' : ''}`}>
        <div className="goal-modal-header">
          <h3>{goal ? 'Detalle de Meta' : 'Nueva Meta'}</h3>
          <button className="goal-modal-close" onClick={cerrarModal}>✖</button>
        </div>

        {!modoEdicion && goal && (
          <div className="edit-toggle">
            <button className="button edit-toggle" onClick={() => setModoEdicion(true)}>Editar Meta</button>
          </div>
        )}

        {goal && (
          <div className="goal-details">
            <p><strong>Monto objetivo:</strong> ${total.toLocaleString()}</p>
            <p><strong>Ahorrado:</strong> ${ahorrado.toLocaleString()}</p>
            <p><strong>Faltante:</strong> ${(total - ahorrado).toLocaleString()}</p>
            <p><strong>Fecha límite:</strong> {goal?.fecha}</p>
          </div>
        )}

        {(modoEdicion || !goal) && (
          <form onSubmit={(e) => { e.preventDefault(); guardarMeta(); }}>
            <input
              type="text"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              placeholder="Ingrese el nombre de su nueva meta"
              required
            />
            <input
              type="text"
              value={displayMonto}
              onChange={(e) => {
                const raw = e.target.value.replace(/\./g, '');
                if (!isNaN(raw)) {
                  setMonto(raw);
                  setDisplayMonto(parseInt(raw || 0).toLocaleString('es-CL'));
                }
              }}
              placeholder="Monto objetivo"
              required
            />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
            <div className="modal-buttons">
              <button type="submit" className="button save-button">Guardar Cambios</button>
              {goal && (
                <button type="button" onClick={eliminarMeta} className="button delete-button">
                  Eliminar Meta
                </button>
              )}
            </div>
          </form>
        )}

        {goal && (
          <>
            <div className="progress-section">
              <h4>Progreso</h4>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${porcentaje}%`, backgroundColor: colorBarra }} />
              </div>
              <p className="progress-text">{Math.round(porcentaje)}% completado</p>
            </div>

            <form onSubmit={guardarAporte} className="aporte-form">
              <input
                type="text"
                placeholder="Aporte"
                value={displayAporte}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, '');
                  if (!isNaN(raw)) {
                    setAporte(raw);
                    const formatted = parseInt(raw || 0).toLocaleString('es-CL');
                    setDisplayAporte(formatted);
                  }
                }}
                required
              />
              <input
                type="date"
                value={fechaAporte}
                onChange={(e) => setFechaAporte(e.target.value)}
                required
              />
              <button type="submit" className="button save-button">Agregar Aporte</button>
            </form>

            <div className="historial">
              <h4>Historial de Aportes</h4>
              <div className="historial-scroll">
                <table className="tabla-historial">
                  <thead>
                    <tr><th>Fecha</th><th>Monto</th></tr>
                  </thead>
                  <tbody>
                    {[...(goal?.contributions || [])]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((c, i) => (
                        <tr key={i}>
                          <td>{c.date}</td>
                          <td>${parseFloat(c.amount).toLocaleString()}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GoalModal;