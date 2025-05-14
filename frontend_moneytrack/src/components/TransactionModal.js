import React, { useState, useEffect } from 'react';
import '../styles/TransactionModal.css';

function TransactionModal({ transaction, categorias, onClose, onSave }) {
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    categoria: '',
    type: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description || '',
        amount: parseFloat(transaction.actual).toLocaleString('es-CL'),
        date: transaction.date || '',
        categoria: transaction.categoria || '',
        type: transaction.type || 'expense'
      });
    }
  }, [transaction]);

  const handleChange = (field, value) => {
    if (field === 'amount') {
      const raw = value.replace(/\./g, '').replace(/[^0-9]/g, '');
      const formatted = raw ? parseInt(raw).toLocaleString('es-CL') : '';
      setForm(prev => ({ ...prev, amount: formatted }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.description || !form.amount || !form.date || !form.categoria) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setError('');
    const token = localStorage.getItem('token');

    // ✅ Ajuste de fecha
    const localDate = new Date(form.date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    const fechaFormateada = localDate.toISOString().split('T')[0];

    const res = await fetch(`http://192.168.1.90:8000/api/transactions/${transaction.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...form,
        actual: parseFloat(form.amount.replace(/\./g, '')),
        date: fechaFormateada // ✅ fecha ajustada al huso horario
      })
    });

    if (res.ok) {
      onSave();
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Editar Transacción</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleUpdate} className="modal-body">
          <div className="input-group-row">
            <span className="input-icon-static" role="img" aria-label="ícono de descripción">📝</span>
            <div className="input-with-label">
              <label htmlFor="description">Nombre o descripción</label>
              <input
                id="description"
                type="text"
                required
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="input-group-row">
            <span className="input-icon-static">$</span>
            <div className="input-with-label">
              <label htmlFor="amount">Monto</label>
              <input
                id="amount"
                type="text"
                inputMode="numeric"
                required
                value={form.amount}
                onChange={e => handleChange('amount', e.target.value)}
              />
            </div>
          </div>

          <div className="input-group-row">
            <span className="input-icon-static" role="img" aria-label="ícono de calendario">📅</span>
            <div className="input-with-label">
              <label htmlFor="date">Fecha</label>
              <input
                id="date"
                type="date"
                required
                value={form.date}
                onChange={e => handleChange('date', e.target.value)}
              />
            </div>
          </div>

          <div className="input-group-row">
            <span className="input-icon-static" role="img" aria-label="ícono de carpeta">📂</span>
            <div className="input-with-label">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                required
                value={form.categoria}
                onChange={e => handleChange('categoria', e.target.value)}
              >
                <option value="">Seleccionar categoría</option>
                {categorias
                  .filter(c => c.tipo === (form.type === 'income' ? 'ingreso' : 'gasto'))
                  .map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono || '📂'} {cat.nombre}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="modal-error">
              <span role="img" aria-label="error">❗</span> {error}
            </div>
          )}

          <div className="modal-footer">
            <button type="submit" className="btn-green">Guardar</button>
            <button type="button" className="btn-red" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionModal;
