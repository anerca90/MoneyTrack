import React, { useEffect, useState } from 'react';

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
    const response = await fetch('http://localhost:8000/api/transactions/', {
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
    const response = await fetch('http://localhost:8000/api/categorias/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`  // 🔧 Token agregado aquí
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
    const response = await fetch('http://localhost:8000/api/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ type, description: desc, actual: parseFloat(amount), date, categoria: categoriaId })
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
    await fetch(`http://localhost:8000/api/transactions/${id}/`, {
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
    await fetch(`http://localhost:8000/api/transactions/${editingId}/`, {
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

  const expenses = transactions.filter(tx => tx.type === 'expense');
  const incomes = transactions.filter(tx => tx.type === 'income');

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px' },
    totalsRow: { display: 'flex', justifyContent: 'center', gap: '50px', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' },
    balance: (value) => ({ color: value >= 0 ? 'green' : 'red' }),
    cardContainer: { display: 'flex', justifyContent: 'space-around', width: '100%' },
    card: { background: '#f9f9f9', borderRadius: '10px', padding: '20px', width: '45%', boxShadow: '0 0 10px rgba(0,0,0,0.05)' },
    button: { padding: '20px', border: 'none', borderRadius: '5px', color: 'white', marginTop: '10px', cursor: 'pointer', width: '100%', fontSize: '16px' },
    red: { backgroundColor: '#e74c3c' },
    green: { backgroundColor: '#2ecc71' },
    input: { width: '100%', padding: '10px', marginBottom: '10px' },
    table: { width: '100%', marginTop: '20px', borderCollapse: 'collapse' },
    thtd: { padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' },
    totals: { fontWeight: 'bold', marginTop: '15px', display: 'flex', justifyContent: 'space-between' }
  };

  const formatMoney = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return '$0';
    return '$' + number.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const totalAmount = (items) => items.reduce((acc, tx) => acc + parseFloat(tx.actual), 0);
  const totalIncome = totalAmount(incomes);
  const totalExpense = totalAmount(expenses);
  const balance = totalIncome - totalExpense;

  const renderRows = (items, type) => items.map((tx, i) => (
    <tr key={tx.id}>
      <td style={styles.thtd}>{i + 1}</td>
      <td style={styles.thtd}>{editingId === tx.id ? (
        <input style={styles.input} type="date" value={editingDate} onChange={(e) => setEditingDate(e.target.value)} required />
      ) : (
        new Date(tx.date).toLocaleDateString('es-CL')
      )}</td>
      <td style={styles.thtd}>{editingId === tx.id ? (
        <select style={styles.input} value={editingCategoria} onChange={(e) => setEditingCategoria(e.target.value)} required>
          <option value="">Seleccionar</option>
          {categorias.filter(c => c.tipo === tx.type).map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      ) : (
        categorias.find(c => c.id === tx.categoria)?.nombre || '—'
      )}</td>
      <td style={styles.thtd}>{editingId === tx.id ? (
        <input style={styles.input} value={editingDesc} onChange={(e) => setEditingDesc(e.target.value)} required />
      ) : (
        tx.description
      )}</td>
      <td style={styles.thtd}>{editingId === tx.id ? (
        <input style={styles.input} type="number" value={editingAmount} onChange={(e) => setEditingAmount(e.target.value)} required />
      ) : (
        formatMoney(tx.actual)
      )}</td>
      <td style={styles.thtd}>
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
    <div style={styles.container}>
      <div style={styles.totalsRow}>
        <div>Total Ingresos: {formatMoney(totalIncome)}</div>
        <div>Total Gastos: {formatMoney(totalExpense)}</div>
        <div style={styles.balance(balance)}>Balance: {formatMoney(balance)}</div>
      </div>
      <div style={styles.cardContainer}>
        {/* GASTOS */}
        <div style={styles.card}>
          <h3>Gastos</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddTransaction('expense', expenseDesc, expenseAmount, expenseDate, expenseCategoria, setExpenseDesc, setExpenseAmount, setExpenseDate, setExpenseCategoria);
          }}>
            <input style={styles.input} value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} placeholder="Descripción" required />
            <input style={styles.input} value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Monto" required type="number" />
            <input style={styles.input} value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} placeholder="Fecha" required type="date" />
            <select style={styles.input} value={expenseCategoria} onChange={e => setExpenseCategoria(e.target.value)} required>
              <option value="">Seleccionar categoría</option>
              {categorias.filter(c => c.tipo === 'gasto').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <button style={{ ...styles.button, ...styles.red }} type="submit">
              + Agregar Gasto
            </button>
          </form>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thtd}>Ítem</th>
                <th style={styles.thtd}>Fecha</th>
                <th style={styles.thtd}>Categoría</th>
                <th style={styles.thtd}>Descripción</th>
                <th style={styles.thtd}>Monto</th>
                <th style={styles.thtd}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {renderRows(expenses, 'expense')}
            </tbody>
          </table>
        </div>

        {/* INGRESOS */}
        <div style={styles.card}>
          <h3>Ingresos</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleAddTransaction('income', incomeDesc, incomeAmount, incomeDate, incomeCategoria, setIncomeDesc, setIncomeAmount, setIncomeDate, setIncomeCategoria);
          }}>
            <input style={styles.input} value={incomeDesc} onChange={(e) => setIncomeDesc(e.target.value)} placeholder="Descripción" required />
            <input style={styles.input} value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} placeholder="Monto" required type="number" />
            <input style={styles.input} value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} placeholder="Fecha" required type="date" />
            <select style={styles.input} value={incomeCategoria} onChange={e => setIncomeCategoria(e.target.value)} required>
              <option value="">Seleccionar categoría</option>
              {categorias.filter(c => c.tipo === 'ingreso').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
            <button style={{ ...styles.button, ...styles.green }} type="submit">
              + Agregar Ingreso
            </button>
          </form>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thtd}>Ítem</th>
                <th style={styles.thtd}>Fecha</th>
                <th style={styles.thtd}>Categoría</th>
                <th style={styles.thtd}>Descripción</th>
                <th style={styles.thtd}>Monto</th>
                <th style={styles.thtd}>Acciones</th>
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
