import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Categories.css';

// 🔐 Instancia de axios con autenticación
const token = localStorage.getItem('token');
const axiosAuth = axios.create({
  baseURL: 'http://192.168.1.90:8000/api/',
  headers: {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  }
});

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [nombreIngreso, setNombreIngreso] = useState('');
  const [iconoIngreso, setIconoIngreso] = useState('');
  const [nombreGasto, setNombreGasto] = useState('');
  const [iconoGasto, setIconoGasto] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingIcono, setEditingIcono] = useState('');

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = () => {
    axiosAuth.get('categorias/')
      .then(res => setCategorias(res.data))
      .catch(err => console.error('Error al obtener categorías:', err));
  };

  const agregarCategoria = (tipo, nombre, icono) => {
    axiosAuth.post('categorias/', { tipo, nombre, icono })
      .then(res => {
        setCategorias([...categorias, res.data]);
        if (tipo === 'ingreso') {
          setNombreIngreso('');
          setIconoIngreso('');
        } else {
          setNombreGasto('');
          setIconoGasto('');
        }
      })
      .catch(err => console.error('Error al agregar categoría:', err));
  };

  const iniciarEdicion = (cat) => {
    setEditingId(cat.id);
    setEditingNombre(cat.nombre);
    setEditingIcono(cat.icono);
  };

  const actualizarCategoria = async (id) => {
    const categoria = categorias.find(c => c.id === id);
    try {
      await axiosAuth.put(`categorias/${id}/`, {
        nombre: editingNombre,
        icono: editingIcono,
        tipo: categoria.tipo
      });
      setEditingId(null);
      fetchCategorias();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
    }
  };

  const eliminarCategoria = async (id) => {
    try {
      await axiosAuth.delete(`categorias/${id}/`);
      fetchCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  };

  const ingresos = categorias.filter(c => c.tipo === 'ingreso');
  const gastos = categorias.filter(c => c.tipo === 'gasto');

  const renderCategorias = (lista, color) => lista.map(cat => (
    <div key={cat.id} className="categorias-item">
      <div className="categorias-icon" style={{ background: color }}>{cat.icono || '❓'}</div>
      {editingId === cat.id ? (
        <div style={{ flex: 1 }}>
          <input
            className="categorias-input"
            value={editingNombre}
            onChange={e => setEditingNombre(e.target.value)}
            placeholder="Nombre"
          />
          <input
            className="categorias-input"
            value={editingIcono}
            onChange={e => setEditingIcono(e.target.value)}
            placeholder="Icono"
          />
        </div>
      ) : (
        <span style={{ flex: 1 }}>{cat.nombre}</span>
      )}
      {editingId === cat.id ? (
        <button onClick={() => actualizarCategoria(cat.id)} style={{ marginLeft: '10px' }}>
          💾
        </button>
      ) : (
        <>
          <button onClick={() => iniciarEdicion(cat)} style={{ marginLeft: '10px' }}>✏️</button>
          <button onClick={() => eliminarCategoria(cat.id)} style={{ marginLeft: '5px' }}>🗑️</button>
        </>
      )}
    </div>
  ));

  return (
    <div className="categorias-container">
      <div className="categorias-title">CATEGORIA</div>
      <div className="categorias-grid">
        {/* INGRESOS */}
        <div className="categorias-column">
          <div className="categorias-header">INGRESOS</div>
          {renderCategorias(ingresos, '#3b82f6')}
          <form
            className="categorias-form"
            onSubmit={(e) => {
              e.preventDefault();
              agregarCategoria('ingreso', nombreIngreso, iconoIngreso);
            }}
          >
            <input
              className="categorias-input"
              placeholder="Nombre"
              value={nombreIngreso}
              onChange={e => setNombreIngreso(e.target.value)}
              required
            />
            <input
              className="categorias-input"
              placeholder="Icono (emoji)"
              value={iconoIngreso}
              onChange={e => setIconoIngreso(e.target.value)}
              required
            />
            <button type="submit" className="categorias-addBtn">+</button>
          </form>
        </div>

        {/* GASTOS */}
        <div className="categorias-column">
          <div className="categorias-header">GASTOS</div>
          {renderCategorias(gastos, '#ef4444')}
          <form
            className="categorias-form"
            onSubmit={(e) => {
              e.preventDefault();
              agregarCategoria('gasto', nombreGasto, iconoGasto);
            }}
          >
            <input
              className="categorias-input"
              placeholder="Nombre"
              value={nombreGasto}
              onChange={e => setNombreGasto(e.target.value)}
              required
            />
            <input
              className="categorias-input"
              placeholder="Icono (emoji)"
              value={iconoGasto}
              onChange={e => setIconoGasto(e.target.value)}
              required
            />
            <button type="submit" className="categorias-addBtn">+</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Categorias;
