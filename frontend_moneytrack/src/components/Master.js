// Master.js - Panel exclusivo para admin1
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/Master.css';

function Master() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('username');

  const getAxios = useCallback(() => axios.create({
    baseURL: 'http://192.168.1.90:8000/api/',
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
  }), [token]);

  useEffect(() => {
    if (currentUser === 'admin1') {
      getAxios().get('admin/users/')
        .then(res => setUsers(res.data))
        .catch(err => console.error(err));
    }
  }, [currentUser, getAxios]);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser(prev => ({ ...prev, [name]: value }));
  };

  const saveEdit = () => {
    getAxios().put(`admin/users/${editingUser.id}/`, editingUser)
      .then(() => {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
      });
  };

  const savePassword = () => {
    getAxios().post(`admin/users/${passwordUser.id}/change-password/`, { new_password: newPassword })
      .then(() => {
        setPasswordUser(null);
        setNewPassword('');
      });
  };

  if (currentUser !== 'admin1') {
    return (
      <div className="master-denied-wrapper">
        <div className="master-denied-box">
          <h2><span role="img" aria-label="prohibido">🚫</span> Acceso denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="master-container">
      <h2 className="master-title">Gestión de Usuarios</h2>
      <input
        type="text"
        className="master-search"
        placeholder="Buscar por nombre o correo"
        value={search}
        onChange={handleSearch}
      />

      <div className="master-controls">
        <label>Mostrar:
          <select value={itemsPerPage} onChange={e => setItemsPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          usuarios por página
        </label>
      </div>

      <div className="master-table-scroll">
        <div className="master-table">
          <div className="master-row header">
            <span>Usuario</span><span>Email</span><span>Acciones</span>
          </div>
          {paginatedUsers.map(user => (
            <div className="master-row" key={user.id}>
              <span>{user.username}</span>
              <span>{user.email}</span>
              <span className="master-actions">
                <button className="edit" onClick={() => setEditingUser(user)}>Editar</button>
                <button className="password" onClick={() => setPasswordUser(user)}>Clave</button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="master-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={i + 1 === currentPage ? 'active' : ''}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {editingUser && (
        <div className="master-modal">
          <div className="modal-content">
            <h3>Editar usuario</h3>
            <input name="username" value={editingUser.username} onChange={handleEditChange} />
            <input name="email" value={editingUser.email} onChange={handleEditChange} />
            <div className="modal-buttons">
              <button onClick={saveEdit}>Guardar</button>
              <button onClick={() => setEditingUser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {passwordUser && (
        <div className="master-modal">
          <div className="modal-content">
            <h3>Cambiar contraseña</h3>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={savePassword}>Guardar</button>
              <button onClick={() => setPasswordUser(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Master;
