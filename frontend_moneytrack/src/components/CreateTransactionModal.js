import React, { useState } from 'react';
import '../styles/CreateTransactionModal.css';

function CreateTransactionModal({ categorias, onClose, onSave }) {
  const getToday = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  const [type, setType] = useState('expense');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: getToday(),
    categoria: ''
  });

  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    if (field === 'amount') {
      const raw = value.replace(/\./g, '').replace(/[^0-9]/g, '');
      const formatted = raw ? parseInt(raw).toLocaleString('es-CL') : '';
      setForm(prev => ({ ...prev, amount: formatted }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevenir reload del form

    if (!form.description || !form.amount || !form.date || !form.categoria) {
      setError('Por favor completa todos los campos.');
      return;
    }
    setError('');

    const token = localStorage.getItem('token');
    const res = await fetch('http://192.168.1.90:8000/api/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...form,
        actual: parseFloat(form.amount.replace(/\./g, '')),
        type
      })
    });

    if (res.ok) {
      onSave();
      onClose();
    }
  };

  return (
    <div className="create-modal-overlay">
      <div className="create-modal">
        <div className="create-modal-header">
          <h3>Agregar Transacción</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="create-modal-body">
          <div className="input-group">
            <label>Tipo</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>

          <div className="input-group">
            <label>Nombre o descripción</label>
            <input
              type="text"
              required
              placeholder="Ingrese el nombre"
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Monto</label>
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder="Ej: 100000"
              value={form.amount}
              onChange={e => handleChange('amount', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Fecha</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={e => handleChange('date', e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Categoría</label>
            <select
              required
              value={form.categoria}
              onChange={e => handleChange('categoria', e.target.value)}
            >
              <option value="">Seleccionar categoría</option>
              {categorias
                .filter(c => c.tipo === (type === 'income' ? 'ingreso' : 'gasto'))
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.icono || '📂'} {c.nombre}
                  </option>
                ))}
            </select>
          </div>

          {error && (
            <div className="modal-error">
              <span role="img" aria-label="error">❗</span> {error}
            </div>
          )}

          <div className="create-modal-footer">
            <button type="submit" className="btn-green">Guardar</button>
            <button type="button" className="btn-red" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTransactionModal;
