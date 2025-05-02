import React, { useState, useEffect } from 'react';

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
    fetch('http://localhost:8000/api/goals/', { headers })
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

    const nueva = {
      tipo: goalType,
      monto: goalAmount,
      fecha: goalDate
    };

    fetch('http://localhost:8000/api/goals/', {
      method: 'POST',
      headers,
      body: JSON.stringify(nueva)
    })
      .then(res => res.json())
      .then((data) => {
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

    fetch('http://localhost:8000/api/contributions/', {
      method: 'POST',
      headers,
      body: JSON.stringify(aporte)
    })
      .then(res => res.json())
      .then((nuevoAporte) => {
        const updatedGoals = goals.map((meta) => {
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

        const updatedSelected = updatedGoals.find((m) => m.id === selectedGoal.id);

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

  const styles = {
    container: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '20px', padding: '30px', fontFamily: 'sans-serif' },
    column: { flex: '1 1 45%', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' },
    box: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    inputFull: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '6px', boxSizing: 'border-box' },
    rowSpace: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
    selectFull: { width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#8e44ad', color: 'white', cursor: 'pointer', fontWeight: 'bold' },
    progressBarBg: { height: '20px', backgroundColor: '#ddd', borderRadius: '10px', overflow: 'hidden' },
    progressBar: { height: '100%', transition: 'width 0.3s ease' },
    th: { padding: '10px', textAlign: 'left', borderBottom: '1px solid #ccc' },
    td: { padding: '10px', borderBottom: '1px solid #eee', textAlign: 'left', verticalAlign: 'middle' }
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🎯 Metas de Ahorro</h2>
      <div style={styles.container}>

        {/* Columna Izquierda */}
        <div style={styles.column}>
          <div style={styles.box}>
            <h3>Agregar Meta</h3>
            <div style={styles.rowSpace}>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Nueva categoría"
                style={styles.inputFull}
              />
              <button style={styles.button} onClick={handleAddDescription}>Agregar</button>
            </div>
          </div>

          <div style={styles.box}>
            <label>Selector de Meta</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              style={styles.selectFull}
            >
              {goalTypeOptions.map((option, i) => (
                <option key={i}>{option}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <label>Monto Objetivo</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  style={styles.inputFull}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>Fecha Límite</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  style={styles.inputFull}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
              <button style={styles.button} onClick={handleGuardarMeta}>Guardar Meta</button>
            </div>

            <h3 style={{ margin: '15px 0' }}>📋 Metas Guardadas</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#f9f9f9', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
              <thead style={{ backgroundColor: '#e0e0e0' }}>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Meta</th>
                  <th style={styles.th}>Monto Objetivo</th>
                  <th style={styles.th}>Fecha Límite</th>
                  <th style={styles.th}>Progreso</th>
                  <th style={styles.th}>Acciones</th>
                  <th style={styles.th}>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((meta, index) => (
                  <tr key={index}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{meta.tipo}</td>
                    <td style={styles.td}>${parseFloat(meta.monto).toLocaleString()}</td>
                    <td style={styles.td}>{meta.fecha}</td>
                    <td style={styles.td}>
                      <div style={{ backgroundColor: '#ddd', borderRadius: '6px', overflow: 'hidden', height: '14px' }}>
                        <div
                          style={{
                            width: `${meta.progreso || 0}%`,
                            backgroundColor: meta.progreso < 50 ? '#e74c3c' : meta.progreso < 100 ? '#f1c40f' : '#2ecc71',
                            height: '100%',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{meta.progreso || 0}%</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ cursor: 'pointer', marginRight: '10px' }}>📝</span>
                      <span style={{ cursor: 'pointer' }}>🗑️</span>
                    </td>
                    <td style={styles.td}>
                      <button onClick={() => handleSeleccionar(meta)} style={{ ...styles.button, padding: '5px 10px', fontSize: '12px' }}>Seleccionar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Columna Derecha */}
        <div style={styles.column}>
          <div style={styles.box}>
            <h4>📈 Barra de Progreso</h4>
            <div style={styles.progressBarBg}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${percentage}%`,
                  backgroundColor: getProgressColor(),
                }}
              />
            </div>
            <p style={{ marginTop: '10px' }}>{Math.round(percentage)}% completado</p>
          </div>

          <div style={styles.box}>
            <h4>📊 Tarjeta de Estado</h4>
            <p><strong>Meta Seleccionada:</strong> {selectedGoal?.tipo}</p>
            <p><strong>Fecha Límite:</strong> {selectedGoal?.fecha}</p>
            <p><strong>Monto Objetivo:</strong> ${parseFloat(selectedGoal?.monto || 0).toLocaleString()}</p>
            <p><strong>Ahorro actual:</strong> ${totalSaved.toLocaleString()}</p>
            <p><strong>Faltante:</strong> ${(goalAmountNum - totalSaved).toLocaleString()}</p>


            <div style={styles.rowSpace}>
              <input
                type="number"
                placeholder="Aporte"
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                style={{ ...styles.inputFull, flex: 1 }}
              />
              <input
                type="date"
                value={contributionDate}
                onChange={(e) => setContributionDate(e.target.value)}
                style={{ ...styles.inputFull, flex: 1 }}
              />
              <button onClick={handleAddContribution} style={styles.button} disabled={!selectedGoal}>
                Agregar Aporte
              </button>
            </div>
          </div>

          <div style={styles.box}>
            <h4>🕒 Historial de Aportes</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead style={{ backgroundColor: '#f1f1f1' }}>
                <tr>
                  <th style={styles.th}>N°</th>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {(selectedGoal?.contributions || []).map((c, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{c.date}</td>
                    <td style={styles.td}>${parseFloat(c.amount).toLocaleString()}</td>
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
