import React, { useEffect, useState } from 'react';
import '../styles/Transactions.css';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [expenseCategoria, setExpenseCategoria] = useState('');

  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState('');
  const [incomeCategoria, setIncomeCategoria] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingDesc, setEditingDesc] = useState('');
  const [editingAmount, setEditingAmount] = useState('');
  const [editingDate, setEditingDate] = useState('');
  const [editingType, setEditingType] = useState('');
  const [editingCategoria, setEditingCategoria] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchCategorias();
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://192.168.1.90:8000/api/transactions/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });
    const data = await response.json();
    setTransactions(data);
  };

  const fetchCategorias = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://192.168.1.90:8000/api/categorias/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      setCategorias(data);
    } else {
      console.error('Error al obtener categorías:', response.status);
    }
  };

  const handleAddTransaction = async (type, desc, amount, date, categoriaId, resetDesc, resetAmount, resetDate, resetCat) => {
    if (!desc || !amount || !date || !categoriaId) return;

    const token = localStorage.getItem('token');
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
    const formattedDate = localDate.toISOString().split('T')[0];

    const response = await fetch('http://192.168.1.90:8000/api/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ type, description: desc, actual: parseFloat(amount), date: formattedDate, categoria: categoriaId })
    });

    if (response.ok) {
      resetDesc('');
      resetAmount('');
      resetDate('');
      resetCat('');
      fetchTransactions();
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://192.168.1.90:8000/api/transactions/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    fetchTransactions();
  };

  const handleEdit = (tx) => {
    setEditingId(tx.id);
    setEditingDesc(tx.description);
    setEditingAmount(tx.actual);
    setEditingDate(tx.date);
    setEditingType(tx.type);
    setEditingCategoria(tx.categoria);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    await fetch(`http://192.168.1.90:8000/api/transactions/${editingId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        description: editingDesc,
        actual: parseFloat(editingAmount),
        date: editingDate,
        type: editingType,
        categoria: editingCategoria
      })
    });
    setEditingId(null);
    fetchTransactions();
  };

  const formatMoney = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '$0';
    return '$' + number.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const expenses = transactions.filter(tx => tx.type === 'expense');
  const incomes = transactions.filter(tx => tx.type === 'income');
  const totalAmount = (items) => items.reduce((acc, tx) => acc + parseFloat(tx.actual), 0);
  const totalIncome = totalAmount(incomes);
  const totalExpense = totalAmount(expenses);
  const balance = totalIncome - totalExpense;

  const renderRows = (items, type) => items.map((tx, i) => (
    <tr key={tx.id}>
      <td>{i + 1}</td>
      <td>
        {editingId === tx.id ? (
          <input className="tx-input" type="date" value={editingDate} onChange={(e) => setEditingDate(e.target.value)} required />
        ) : (
          tx.date ? new Date(tx.date + 'T00:00:00').toLocaleDateString('es-CL') : ''
        )}
      </td>
      <td>
        {editingId === tx.id ? (
          <select className="tx-input" value={editingCategoria} onChange={(e) => setEditingCategoria(e.target.value)} required>
            <option value="">Seleccionar</option>
            {categorias.filter(c => c.tipo === tx.type).map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        ) : (
          categorias.find(c => c.id === tx.categoria)?.nombre || '—'
        )}
      </td>
      <td>
        {editingId === tx.id ? (
          <input className="tx-input" value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} required />
        ) : (
          tx.description
        )}
      </td>
      <td>
        {editingId === tx.id ? (
          <input className="tx-input" type="number" value={editingAmount} onChange={(e) => setEditingAmount(e.target.value)} required />
        ) : (
          formatMoney(tx.actual)
        )}
      </td>
      <td>
        {editingId === tx.id ? (
          <span role="img" aria-label="Guardar" onClick={handleUpdate} style={{ cursor: 'pointer' }}>💾</span>
        ) : (
          <>
            <span role="img" aria-label="Editar" onClick={() => handleEdit(tx)} style={{ cursor: 'pointer', marginRight: '8px' }}>✏️</span>
            <span role="img" aria-label="Eliminar" onClick={() => handleDelete(tx.id)} style={{ cursor: 'pointer' }}>🗑️</span>
          </>
        )}
      </td>
    </tr>
  ));

  return (
    <div className="transactions-container">
      <div className="totals-row">
        <div>Total Ingresos: {formatMoney(totalIncome)}</div>
        <div>Total Gastos: {formatMoney(totalExpense)}</div>
        <div className={balance >= 0 ? "balance-positive" : "balance-negative"}>
          Balance: {formatMoney(balance)}
        </div>
      </div>

      <div className="card-container">
        {/* Gastos */}
        <div className="tx-card">
          <h3>Gastos</h3>
          <form className="tx-form" onSubmit={(e) => {
            e.preventDefault();
            handleAddTransaction('expense', expenseDesc, expenseAmount, expenseDate, expenseCategoria, setExpenseDesc, setExpenseAmount, setExpenseDate, setExpenseCategoria);
          }}>
            <input className="tx-input" value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="Descripción" required />
            <input className="tx-input" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Monto" required type="number" />
            <input className="tx-input" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} placeholder="Fecha" required type="date" />
            <select className="tx-input" value={expenseCategoria} onChange={e => setExpenseCategoria(e.target.value)} required>
              <option value="">Seleccionar categoría</option>
              {categorias.filter(c => c.tipo === 'gasto').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <button className="tx-button red" type="submit">+ Agregar Gasto</button>
          </form>

          <table className="tx-table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renderRows(expenses, 'expense')}
            </tbody>
          </table>
        </div>

        {/* Ingresos */}
        <div className="tx-card">
          <h3>Ingresos</h3>
          <form className="tx-form" onSubmit={(e) => {
            e.preventDefault();
            handleAddTransaction('income', incomeDesc, incomeAmount, incomeDate, incomeCategoria, setIncomeDesc, setIncomeAmount, setIncomeDate, setIncomeCategoria);
          }}>
            <input className="tx-input" value={incomeDesc} onChange={(e) => setIncomeDesc(e.target.value)} placeholder="Descripción" required />
            <input className="tx-input" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} placeholder="Monto" required type="number" />
            <input className="tx-input" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} placeholder="Fecha" required type="date" />
            <select className="tx-input" value={incomeCategoria} onChange={e => setIncomeCategoria(e.target.value)} required>
              <option value="">Seleccionar categoría</option>
              {categorias.filter(c => c.tipo === 'ingreso').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <button className="tx-button green" type="submit">+ Agregar Ingreso</button>
          </form>

          <table className="tx-table">
            <thead>
              <tr>
                <th>Ítem</th>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renderRows(incomes, 'income')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;
