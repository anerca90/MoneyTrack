import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  const styles = {
    container: {
      padding: '20px',
      background: '#e5e7eb',
      minHeight: '100vh',
      fontFamily: 'sans-serif'
    },
    title: {
      textAlign: 'center',
      background: '#d1d5db',
      padding: '10px',
      fontWeight: 'bold',
      fontSize: '20px'
    },
    grid: {
      display: 'flex',
      gap: '20px',
      background: '#fff',
      border: '1px solid #ccc',
      borderRadius: '10px',
      overflow: 'hidden'
    },
    column: {
      flex: 1,
      padding: '20px'
    },
    header: {
      background: '#e9d5ff',
      padding: '10px',
      textAlign: 'center',
      fontWeight: 'bold'
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid #eee'
    },
    icon: (color) => ({
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: color,
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '24px',
      marginRight: '10px'
    }),
    input: {
      margin: '5px 0',
      padding: '8px',
      width: '90%',
      border: '1px solid #ccc',
      borderRadius: '5px'
    },
    addBtn: {
      background: '#ec4899',
      color: 'white',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '10px'
    }
  };

  const renderCategorias = (lista, color) => lista.map(cat => (
    <div key={cat.id} style={styles.item}>
      <div style={styles.icon(color)}>{cat.icono || '❓'}</div>
      {editingId === cat.id ? (
        <div style={{ flex: 1 }}>
          <input
            style={styles.input}
            value={editingNombre}
            onChange={e => setEditingNombre(e.target.value)}
            placeholder="Nombre"
          />
          <input
            style={styles.input}
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
          <span role="img" aria-label="Guardar">💾</span>
        </button>
      ) : (
        <>
          <button onClick={() => iniciarEdicion(cat)} style={{ marginLeft: '10px' }}>
            <span role="img" aria-label="Editar">✏️</span>
          </button>
          <button onClick={() => eliminarCategoria(cat.id)} style={{ marginLeft: '5px' }}>
            <span role="img" aria-label="Eliminar">🗑️</span>
          </button>
        </>
      )}
    </div>
  ));

  return (
    <div style={styles.container}>
      <div style={styles.title}>CATEGORIA</div>
      <div style={styles.grid}>
        {/* INGRESOS */}
        <div style={styles.column}>
          <div style={styles.header}>INGRESOS</div>
          {renderCategorias(ingresos, '#3b82f6')}
          <form style={styles.form} onSubmit={(e) => {
            e.preventDefault();
            agregarCategoria('ingreso', nombreIngreso, iconoIngreso);
          }}>
            <input style={styles.input} placeholder="Nombre" value={nombreIngreso} onChange={e => setNombreIngreso(e.target.value)} required />
            <input style={styles.input} placeholder="Icono (emoji)" value={iconoIngreso} onChange={e => setIconoIngreso(e.target.value)} required />
            <button type="submit" style={styles.addBtn}>+</button>
          </form>
        </div>

        {/* GASTOS */}
        <div style={styles.column}>
          <div style={styles.header}>GASTOS</div>
          {renderCategorias(gastos, '#ef4444')}
          <form style={styles.form} onSubmit={(e) => {
            e.preventDefault();
            agregarCategoria('gasto', nombreGasto, iconoGasto);
          }}>
            <input style={styles.input} placeholder="Nombre" value={nombreGasto} onChange={e => setNombreGasto(e.target.value)} required />
            <input style={styles.input} placeholder="Icono (emoji)" value={iconoGasto} onChange={e => setIconoGasto(e.target.value)} required />
            <button type="submit" style={styles.addBtn}>+</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Categorias;
