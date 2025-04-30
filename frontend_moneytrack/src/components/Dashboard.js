import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [filterType, setFilterType] = useState('range');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/transactions/', {
      headers: {
        'Authorization': `Token ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        const currentDate = new Date();
        const currentMonth = currentDate.toISOString().slice(0, 7);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const defaultFiltered = data.filter(tx => tx.date.startsWith(currentMonth));
        setFilteredTransactions(defaultFiltered);
        setDateRange({ from: `${currentMonth}-01`, to: `${currentMonth}-${lastDay}` });
      });
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(tx => {
      if (filterType === 'before') return tx.date <= dateRange.to;
      if (filterType === 'after') return tx.date >= dateRange.from;
      return tx.date >= dateRange.from && tx.date <= dateRange.to;
    });
    setFilteredTransactions(filtered);
  }, [transactions, dateRange, filterType]);

  const formatMoney = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? '$0' : '$' + number.toLocaleString('es-CL', { minimumFractionDigits: 0 });
  };

  const incomeData = {};
  const expenseData = {};
  const pieIncomeCategories = {};
  const pieExpenseCategories = {};

  filteredTransactions.forEach(tx => {
    const month = tx.date.slice(0, 7);
    if (tx.type === 'income') {
      incomeData[month] = (incomeData[month] || 0) + parseFloat(tx.actual);
      pieIncomeCategories[tx.description] = (pieIncomeCategories[tx.description] || 0) + parseFloat(tx.actual);
    } else {
      expenseData[month] = (expenseData[month] || 0) + parseFloat(tx.actual);
      pieExpenseCategories[tx.description] = (pieExpenseCategories[tx.description] || 0) + parseFloat(tx.actual);
    }
  });

  const barData = Object.keys({ ...incomeData, ...expenseData }).sort().map(month => ({
    month,
    Ingresos: incomeData[month] || 0,
    Gastos: expenseData[month] || 0,
    Total: (incomeData[month] || 0) - (expenseData[month] || 0)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const pieData = (source) => Object.entries(source).map(([name, value]) => ({ name, value }));

  const renderPieTable = (source, type) => {
    const entries = Object.entries(source);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    return (
      <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', background: '#ecf0f1', color: '#333', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '6px' }}>
        <thead style={{ background: '#3498db', color: 'white' }}>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left' }}>N°</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Categoría</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, value], i) => (
            <tr key={i}>
              <td style={{ padding: '8px' }}>{i + 1}</td>
              <td style={{ padding: '8px', textAlign: 'left' }}>{name}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(value)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ccc' }}>
            <td></td>
            <td style={{ padding: '8px', textAlign: 'right' }}>Total</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const renderTable = (data) => {
    const total = data.reduce((sum, row) => sum + row.Total, 0);
    return (
      <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', background: '#ecf0f1', color: '#333', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '6px' }}>
        <thead style={{ background: '#3498db', color: 'white' }}>
          <tr>
            <th style={{ padding: '8px', textAlign: 'left' }}>Fecha</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Ingresos</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Gastos</th>
            <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: '8px' }}>{row.month}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(row.Ingresos)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(row.Gastos)}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(row.Total)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ccc' }}>
            <td colSpan="2"></td>
            <td style={{ padding: '8px', textAlign: 'right' }}>Total</td>
            <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoney(total)}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  const totalIncome = Object.values(pieIncomeCategories).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(pieExpenseCategories).reduce((a, b) => a + b, 0);
  const balance = totalIncome - totalExpense;

  const styles = {
    container: {
      marginLeft: '20px',
      padding: '30px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    },
    row: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: '60px'
    },
    chartBox: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      marginBottom: '40px',
      backgroundColor: '#f4f4f4',
      padding: '20px',
      borderRadius: '10px'
    },
    filter: {
      marginBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-start',
      background: '#e0f7fa',
      padding: '20px 25px',
      borderRadius: '10px',
      fontSize: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    },
    filterButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    filterButton: {
      backgroundColor: '#ffffff',
      border: '1px solid #aaa',
      borderRadius: '6px',
      padding: '8px 14px',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background 0.3s, transform 0.2s'
    },
    pieSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '45%',
      backgroundColor: '#f4f4f4',
      padding: '20px',
      borderRadius: '10px'
    },
    sideBySide: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '20px',
      backgroundColor: '#f4f4f4',
      padding: '20px',
      borderRadius: '10px'
    },
    half: {
      width: '50%'
    }
  };

  return (
    <div style={styles.container}>
      <h2>Dashboard Principal</h2>

      <div style={styles.filter}>
        <div style={styles.filterButtons}>
          <strong>Tipo de Filtro:</strong>
          <button style={styles.filterButton} onClick={() => setFilterType('range')}>Rango Fechas</button>
          <button style={styles.filterButton} onClick={() => setFilterType('before')}>Anterior a</button>
          <button style={styles.filterButton} onClick={() => setFilterType('after')}>Posterior a</button>
        </div>
        <div>
          <label>Desde: <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} /></label>
          <label style={{ marginLeft: '10px' }}>Hasta: <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} /></label>
        </div>
      </div>

      <div style={styles.sideBySide}>
        <div style={styles.half}>
          <h3>Comparación Mensual de Ingresos y Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 60, left: 80, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-15} textAnchor="end" interval={0} height={50} />
              <YAxis tickFormatter={formatMoney} />
              <Tooltip formatter={formatMoney} />
              <Legend />
              <Bar dataKey="Ingresos" fill="#2ecc71" />
              <Bar dataKey="Gastos" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.half}>
          <h4>Resumen Ingresos vs Gastos</h4>
          {renderTable(barData)}
        </div>
      </div>

      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Balance Actual: {formatMoney(balance)}</h3>

      <div style={styles.row}>
        <div style={styles.pieSection}>
          <h4>Distribución de Ingresos</h4>
          <PieChart width={500} height={360}>
            <Pie
              data={pieData(pieIncomeCategories)}
              cx="40%"
              cy="50%"
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              label={({ name }) => name.length > 15 ? name.slice(0, 12) + '...' : name}
              labelLine={false}
            >
              {pieData(pieIncomeCategories).map((entry, index) => (
                <Cell key={`cell-income-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend layout="vertical" align="right" verticalAlign="middle" />
            <Tooltip formatter={formatMoney} />
          </PieChart>
          {renderPieTable(pieIncomeCategories)}
        </div>

        <div style={styles.pieSection}>
          <h4>Distribución de Gastos</h4>
          <PieChart width={500} height={360}>
            <Pie
              data={pieData(pieExpenseCategories)}
              cx="40%"
              cy="50%"
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              label={({ name }) => name.length > 15 ? name.slice(0, 12) + '...' : name}
              labelLine={false}
            >
              {pieData(pieExpenseCategories).map((entry, index) => (
                <Cell key={`cell-expense-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend layout="vertical" align="right" verticalAlign="middle" />
            <Tooltip formatter={formatMoney} />
          </PieChart>
          {renderPieTable(pieExpenseCategories)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;