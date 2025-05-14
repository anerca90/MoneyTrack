import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [filterType, setFilterType] = useState('range');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://192.168.1.90:8000/api/transactions/', {
      headers: { Authorization: `Token ${token}` }
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
    const categoriaKey = tx.categoria_nombre || 'Sin categoría';

    if (tx.type === 'income') {
      incomeData[month] = (incomeData[month] || 0) + parseFloat(tx.actual);
      pieIncomeCategories[categoriaKey] = (pieIncomeCategories[categoriaKey] || 0) + parseFloat(tx.actual);
    } else {
      expenseData[month] = (expenseData[month] || 0) + parseFloat(tx.actual);
      pieExpenseCategories[categoriaKey] = (pieExpenseCategories[categoriaKey] || 0) + parseFloat(tx.actual);
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

  const renderPieTable = (source) => {
    const entries = Object.entries(source);
    const total = entries.reduce((sum, [, val]) => sum + val, 0);
    return (
      <div className="table-responsive">
        <table className="goals-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'right' }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, value], i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{name}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(value)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ccc' }}>
              <td></td>
              <td style={{ textAlign: 'right' }}>Total</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable = (data) => {
    const total = data.reduce((sum, row) => sum + row.Total, 0);
    return (
      <div className="table-responsive">
        <table className="goals-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Ingresos</th>
              <th style={{ textAlign: 'right' }}>Gastos</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.month}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(row.Ingresos)}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(row.Gastos)}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(row.Total)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', borderTop: '1px solid #ccc' }}>
              <td colSpan="2"></td>
              <td style={{ textAlign: 'right' }}>Total</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const totalIncome = Object.values(pieIncomeCategories).reduce((a, b) => a + b, 0);
  const totalExpense = Object.values(pieExpenseCategories).reduce((a, b) => a + b, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard Principal</h2>

      <div className="dashboard-filter">
        <div className="dashboard-filter-buttons">
          <strong>Tipo de Filtro:</strong>
          <button className="dashboard-btn" onClick={() => setFilterType('range')}>Rango Fechas</button>
          <button className="dashboard-btn" onClick={() => setFilterType('before')}>Anterior a</button>
          <button className="dashboard-btn" onClick={() => setFilterType('after')}>Posterior a</button>
        </div>
        <div className="dashboard-filter-dates">
          <label>Desde: <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} /></label>
          <label>Hasta: <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} /></label>
        </div>
      </div>

      <div className="dashboard-flex">
        <div className="dashboard-chart">
          <h3>Comparación Mensual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
        <div className="dashboard-table">
          <h3>Resumen</h3>
          {renderTable(barData)}
        </div>
      </div>

      <h3 className="dashboard-balance">Balance Actual: {formatMoney(balance)}</h3>

      <div className="dashboard-pies">
        <div className="dashboard-pie">
          <h4>Distribución Ingresos</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData(pieIncomeCategories)}
                cx="40%"
                cy="50%"
                outerRadius={100}
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
          </ResponsiveContainer>
          {renderPieTable(pieIncomeCategories)}
        </div>
        <div className="dashboard-pie">
          <h4>Distribución Gastos</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData(pieExpenseCategories)}
                cx="40%"
                cy="50%"
                outerRadius={100}
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
          </ResponsiveContainer>
          {renderPieTable(pieExpenseCategories)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
