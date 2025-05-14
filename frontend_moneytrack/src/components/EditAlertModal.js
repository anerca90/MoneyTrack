import React, { useState } from 'react';
import '../styles/Alerts.css';

const EditAlertModal = ({ alerta, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({ ...alerta });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://192.168.1.90:8000/api/alerts/${alerta.id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Token ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(data => onUpdated(data));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Editar Alerta</h3>

        <form onSubmit={handleSubmit} className="edit-form">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <label className="label">Rango de fechas para la alerta</label>
          <div className="input-group">
            <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
            <input type="date" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required />
          </div>

          <input
            type="text"
            name="limite"
            placeholder="Ingrese monto de la alerta"
            value={formData.limite ? Number(formData.limite).toLocaleString() : ''}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                limite: e.target.value.replace(/\D/g, '')
              }))
            }
            required
          />

          <div className="form-group">
            <label className="label">Estado de la alerta</label>
            <div className="switch-container">
              <label className="switch">
                <input type="checkbox" name="activa" checked={formData.activa} onChange={handleChange} />
                <span className="slider"></span>
              </label>
              <span className="switch-label">{formData.activa ? 'Activa' : 'Inactiva'}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" className="button green">Guardar cambios</button>
            <button type="button" className="button red" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlertModal;
