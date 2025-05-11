import React, { useState, useEffect } from 'react';
import '../styles/Goals.css';

function Goals() {
  const [goalTypeOptions, setGoalTypeOptions] = useState([
    'Casa 🏠', 'Auto 🚗', 'Vacaciones 🌴', 'Fondo de Emergencia 💼', 'Estudio 🎓', 'Otros'
  ]);
  const [goalType, setGoalType] = useState('Casa 🏠');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [newContribution, setNewContribution] = useState('');
  const [contributionDate, setContributionDate] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`
  };

  useEffect(() => {
    fetch('http://192.168.1.90:8000/api/goals/', { headers })
      .then(res => res.json())
      .then(data => setGoals(data))
      .catch(err => console.error('Error al cargar metas:', err));
  }, []);

  const handleAddDescription = () => {
    if (newDescription.trim()) {
      setGoalTypeOptions([...goalTypeOptions, newDescription]);
      setGoalType(newDescription);
      setNewDescription('');
    }
  };

  const handleGuardarMeta = () => {
    if (!goalAmount || !goalDate) return;
    const nueva = { tipo: goalType, monto: goalAmount, fecha: goalDate };

    fetch('http://192.168.1.90:8000/api/goals/', {
      method: 'POST',
      headers,
      body: JSON.stringify(nueva)
    })
      .then(res => res.json())
      .then(data => {
        setGoals([...goals, { ...data, contributions: [], progreso: 0 }]);
        setGoalAmount('');
        setGoalDate('');
      })
      .catch(err => console.error('Error al guardar meta:', err));
  };

  const handleSeleccionar = (meta) => {
    setSelectedGoal(meta);
  };

  const handleAddContribution = () => {
    if (!newContribution || !selectedGoal || !contributionDate) return;

    const aporte = {
      goal: selectedGoal.id,
      amount: newContribution,
      date: contributionDate
    };

    fetch('http://192.168.1.90:8000/api/contributions/', {
      method: 'POST',
      headers,
      body: JSON.stringify(aporte)
    })
      .then(res => res.json())
      .then(nuevoAporte => {
        const updatedGoals = goals.map(meta => {
          if (meta.id === selectedGoal.id) {
            const updatedContributions = [...(meta.contributions || []), nuevoAporte];
            const total = updatedContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
            const porcentaje = Math.min((total / parseFloat(meta.monto)) * 100, 100);
            return {
              ...meta,
              contributions: updatedContributions,
              progreso: Math.round(porcentaje)
            };
          }
          return meta;
        });

        const updatedSelected = updatedGoals.find(m => m.id === selectedGoal.id);
        setGoals(updatedGoals);
        setSelectedGoal(updatedSelected);
        setNewContribution('');
        setContributionDate('');
      })
      .catch(err => console.error('Error al guardar aporte:', err));
  };

  const totalSaved = selectedGoal?.contributions?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0;
  const goalAmountNum = parseFloat(selectedGoal?.monto || 0);
  const percentage = goalAmountNum ? Math.min((totalSaved / goalAmountNum) * 100, 100) : 0;

  const getProgressColor = () => {
    if (percentage < 50) return '#e74c3c';
    if (percentage < 80) return '#f1c40f';
    return '#2ecc71';
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🎯 Metas de Ahorro</h2>
      <div className="goals-container">

        {/* Columna izquierda */}
        <div className="goals-column">
          <div className="goals-box">
            <h3>Agregar Meta</h3>
            <div className="goals-row-space">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Nueva categoría"
                className="goals-input"
              />
              <button className="goals-button" onClick={handleAddDescription}>Agregar</button>
            </div>
          </div>

          <div className="goals-box">
            <label>Selector de Meta</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="goals-select"
            >
              {goalTypeOptions.map((option, i) => (
                <option key={i}>{option}</option>
              ))}
            </select>

            <div className="goals-row-space" style={{ marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Monto Objetivo</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="goals-input"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Fecha Límite</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="goals-input"
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
              <button className="goals-button" onClick={handleGuardarMeta}>Guardar Meta</button>
            </div>

            <h3 style={{ margin: '15px 0' }}>📋 Metas Guardadas</h3>
            <table className="goals-table">
              <thead style={{ backgroundColor: '#e0e0e0' }}>
                <tr>
                  <th className="goals-th">#</th>
                  <th className="goals-th">Meta</th>
                  <th className="goals-th">Monto Objetivo</th>
                  <th className="goals-th">Fecha Límite</th>
                  <th className="goals-th">Progreso</th>
                  <th className="goals-th">Acciones</th>
                  <th className="goals-th">Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((meta, index) => (
                  <tr key={index}>
                    <td className="goals-td">{index + 1}</td>
                    <td className="goals-td">{meta.tipo}</td>
                    <td className="goals-td">${parseFloat(meta.monto).toLocaleString()}</td>
                    <td className="goals-td">{meta.fecha}</td>
                    <td className="goals-td">
                      <div className="goals-progress-bg">
                        <div
                          className="goals-progress-bar"
                          style={{
                            width: `${meta.progreso || 0}%`,
                            backgroundColor: meta.progreso < 50
                              ? '#e74c3c'
                              : meta.progreso < 100
                                ? '#f1c40f'
                                : '#2ecc71'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{meta.progreso || 0}%</div>
                    </td>
                    <td className="goals-td">
                      <span style={{ cursor: 'pointer', marginRight: '10px' }}>📝</span>
                      <span style={{ cursor: 'pointer' }}>🗑️</span>
                    </td>
                    <td className="goals-td">
                      <button onClick={() => handleSeleccionar(meta)} className="goals-button" style={{ padding: '5px 10px', fontSize: '12px' }}>
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="goals-column">
          <div className="goals-box">
            <h4>📈 Barra de Progreso</h4>
            <div className="goals-progress-bg">
              <div
                className="goals-progress-bar"
                style={{ width: `${percentage}%`, backgroundColor: getProgressColor() }}
              />
            </div>
            <p style={{ marginTop: '10px' }}>{Math.round(percentage)}% completado</p>
          </div>

          <div className="goals-box">
            <h4>📊 Tarjeta de Estado</h4>
            <p><strong>Meta Seleccionada:</strong> {selectedGoal?.tipo}</p>
            <p><strong>Fecha Límite:</strong> {selectedGoal?.fecha}</p>
            <p><strong>Monto Objetivo:</strong> ${parseFloat(selectedGoal?.monto || 0).toLocaleString()}</p>
            <p><strong>Ahorro actual:</strong> ${totalSaved.toLocaleString()}</p>
            <p><strong>Faltante:</strong> ${(goalAmountNum - totalSaved).toLocaleString()}</p>

            <div className="goals-row-space">
              <input
                type="number"
                placeholder="Aporte"
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                className="goals-input"
              />
              <input
                type="date"
                value={contributionDate}
                onChange={(e) => setContributionDate(e.target.value)}
                className="goals-input"
              />
              <button onClick={handleAddContribution} className="goals-button" disabled={!selectedGoal}>
                Agregar Aporte
              </button>
            </div>
          </div>

          <div className="goals-box">
            <h4>🕒 Historial de Aportes</h4>
            <table className="goals-table">
              <thead style={{ backgroundColor: '#f1f1f1' }}>
                <tr>
                  <th className="goals-th">N°</th>
                  <th className="goals-th">Fecha</th>
                  <th className="goals-th">Monto</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGoal?.contributions || []).map((c, i) => (
                  <tr key={i}>
                    <td className="goals-td">{i + 1}</td>
                    <td className="goals-td">{c.date}</td>
                    <td className="goals-td">${parseFloat(c.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Goals;
