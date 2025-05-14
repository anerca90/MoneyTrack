
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Categories.css';

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

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nuevas, setNuevas] = useState({
    ingreso: { nombre: '', icono: '' },
    gasto: { nombre: '', icono: '' }
  });

  const [editando, setEditando] = useState(null);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = () => {
    getAxios().get('categorias/')
      .then(res => setCategorias(res.data))
      .catch(err => console.error('Error al obtener categorías:', err));
  };

  const agregarCategoria = (tipo) => {
    const { nombre, icono } = nuevas[tipo];
    getAxios().post('categorias/', { tipo, nombre, icono })

      .then(() => {
        setNuevas(prev => ({ ...prev, [tipo]: { nombre: '', icono: '' } }));
        obtenerCategorias(); // ✅ Reconsulta desde el backend (filtrado por usuario)
      });
  };

  const guardarCambios = (cat) => {
    getAxios().put(`categorias/${cat.id}/`, {
      nombre: cat.nombre,
      icono: cat.icono,
      tipo: cat.tipo
    }).then(() => {
      setEditando(null);
      obtenerCategorias();
    });
  };

  const eliminarCategoria = (id) => {
    getAxios().delete(`categorias/${id}/`).then(obtenerCategorias);
  };

  const iniciarEdicion = (cat) => {
    setEditando({ ...cat });
  };

  const renderCategorias = (tipo, color) => {
    return categorias
      .filter(cat => cat.tipo === tipo)
      .map(cat => (
        <div key={cat.id} className="categoria-item">
          {/* Icono circular */}
          <div className="categoria-icono" style={{ background: color }}>
            <span role="img" aria-label={cat.nombre || 'icono'}>
              {cat.icono || '❓'}
            </span>
          </div>

          {/* Nombre o campos editables */}
          {editando?.id === cat.id ? (
            <div className="categoria-editar">
              <input
                className="categoria-input"
                value={editando.nombre}
                onChange={e =>
                  setEditando(prev => ({ ...prev, nombre: e.target.value }))
                }
              />
              <input
                className="categoria-input"
                value={editando.icono}
                onChange={e =>
                  setEditando(prev => ({ ...prev, icono: e.target.value }))
                }
              />
            </div>
          ) : (
            <span className="categoria-nombre">{cat.nombre}</span>
          )}

          {/* Botones de acción */}
          <div className="categoria-acciones">
            {editando?.id === cat.id ? (
              <button
                onClick={() => guardarCambios(editando)}
                className="button green"
              >
                Guardar
              </button>
            ) : (
              <>
                <button
                  onClick={() => iniciarEdicion(cat)}
                  className="button blue"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarCategoria(cat.id)}
                  className="button red"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      ));
  };


  const renderFormulario = (tipo) => (
    <form
      className="categoria-form"
      onSubmit={(e) => {
        e.preventDefault();
        agregarCategoria(tipo);
      }}
    >
      <input
        className="categoria-input"
        placeholder="Nombre"
        value={nuevas[tipo].nombre}
        onChange={e => setNuevas(prev => ({ ...prev, [tipo]: { ...prev[tipo], nombre: e.target.value } }))}
        required
      />
      <input
        className="categoria-input"
        placeholder="Icono (emoji)"
        value={nuevas[tipo].icono}
        onChange={e => setNuevas(prev => ({ ...prev, [tipo]: { ...prev[tipo], icono: e.target.value } }))}
        required
      />
      <button type="submit" className="categoria-add" title="Agregar">+</button>
    </form>
  );
  return (
    <div className="categoria-container">
      <h2 className="categoria-titulo">Gestión de Categorías</h2>

      <div className="categoria-columns">
        <div className="categoria-columna">
          <h3 className="categoria-header ingresos">INGRESOS</h3>
          <div className="categoria-lista-scroll">
            {renderCategorias('ingreso', '#2c7a7b')}
          </div>
          {renderFormulario('ingreso')}
        </div>

        <div className="categoria-columna">
          <h3 className="categoria-header gastos">GASTOS</h3>
          <div className="categoria-lista-scroll">
            {renderCategorias('gasto', '#4a5568')}
          </div>
          {renderFormulario('gasto')}
        </div>
      </div>
    </div>
  );
}

export default Categorias;
