
// Parte 1: importaciones y funciones de ayuda
import React, { useEffect, useState } from 'react';
import TransactionModal from './TransactionModal';
import CreateTransactionModal from './CreateTransactionModal';
import '../styles/Transactions.css';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';




function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [editingTx, setEditingTx] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gastosToShow, setGastosToShow] = useState(10);
  const [ingresosToShow, setIngresosToShow] = useState(10);

  const getFirstDayOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  };

  const getToday = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  const [fechaInicio, setFechaInicio] = useState(getFirstDayOfMonth());
  const [fechaFin, setFechaFin] = useState(getToday());
  const [categoriaFiltro, setCategoriaFiltro] = useState('');


  useEffect(() => {
    fetchTransactions();
    fetchCategorias();
  }, []);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://192.168.1.90:8000/api/transactions/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    setTransactions(data);
  };

  const fetchCategorias = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://192.168.1.90:8000/api/categorias/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    setCategorias(data);
  };

  const formatMoney = (value) => {
    const number = parseFloat(value);
    return isNaN(number)
      ? '$0'
      : '$' + number.toLocaleString('es-CL', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://192.168.1.90:8000/api/transactions/${id}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Token ${token}` }
    });
    fetchTransactions();
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingTx(null);
    setShowEditModal(false);
    fetchTransactions();
  };

  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => {
    setShowCreateModal(false);
    fetchTransactions();
  };
  
  const renderCards = (type, limit) =>
    transactions
      .filter(tx =>
        tx.type === type &&
        tx.date >= fechaInicio &&
        tx.date <= fechaFin &&
        (categoriaFiltro === '' || tx.categoria === parseInt(categoriaFiltro))
      )
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.id - a.id; // Si tienen la misma fecha, muestra el más nuevo primero
      })
      .slice(0, limit)
      .map(tx => {
        const cat = categorias.find(c => c.id === tx.categoria);
        return (
          <div key={tx.id} className={`tx-card ${tx.type}`}>
            <p><strong>Descripción:</strong> {tx.description}</p>
            <p><strong>Categoría:</strong> {cat?.icono || '📂'} {cat?.nombre || 'Sin categoría'}</p>
            <p><strong>Fecha:</strong> {
              new Date(new Date(tx.date).getTime() + new Date().getTimezoneOffset() * 60000)
                .toLocaleDateString('es-CL')
            }</p>
            <p><strong>Monto:</strong> {formatMoney(tx.actual)}</p>
            <div className="tx-actions">
              <button className="button green" onClick={() => openEditModal(tx)}>Editar</button>
              <button className="button red" onClick={() => handleDelete(tx.id)}>Eliminar</button>
            </div>
          </div>
        );
      });
  
  const totalIncome = transactions.filter(t =>
    t.type === 'income' && t.date >= fechaInicio && t.date <= fechaFin
  ).reduce((acc, t) => acc + parseFloat(t.actual), 0);

  const totalExpense = transactions.filter(t =>
    t.type === 'expense' && t.date >= fechaInicio && t.date <= fechaFin
  ).reduce((acc, t) => acc + parseFloat(t.actual), 0);

  const balance = totalIncome - totalExpense;

  // obtener usuario actual
  const [usuario, setUsuario] = useState('');
    useEffect(() => {
      const fetchUsuario = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://192.168.1.90:8000/api/current_user/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        const data = await res.json();
        setUsuario(data.username);
      };

      fetchUsuario();
    }, []);


  // ✅ Exportar a PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const nombreUsuario = usuario || 'Usuario';
      doc.setFontSize(8);
      doc.setTextColor(200);
      doc.setFont('helvetica', 'bold');
      doc.text('MoneyTrack', pageWidth - 20, 10, { align: 'right' });
      doc.setTextColor(0); // restaurar color

      const gastos = transactions.filter(tx =>
        tx.type === 'expense' && tx.date >= fechaInicio && tx.date <= fechaFin
      );
      const ingresos = transactions.filter(tx =>
        tx.type === 'income' && tx.date >= fechaInicio && tx.date <= fechaFin
      );

      const mapRows = (arr) =>
        arr.map(tx => {
          const cat = categorias.find(c => c.id === tx.categoria);
          return [
            cat?.nombre || 'Sin categoría',
            tx.description,
            new Date(tx.date).toLocaleDateString('es-CL'),
            formatMoney(tx.actual)
          ];
        });
      
      // ==== ENCABEZADO ====
      doc.setFontSize(18);
      doc.text(`Reporte de Transacciones — ${nombreUsuario}`, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Desde: ${fechaInicio}     Hasta: ${fechaFin}`, pageWidth / 2, 28, { align: 'center' });

      let currentY = 36;

      // ==== TABLA GASTOS ====
      if (gastos.length > 0) {
        doc.setLineWidth(0.5);
        doc.setDrawColor(150);
        doc.line(14, currentY, pageWidth - 14, currentY);
        currentY += 8;

        doc.setFont('helvetica', 'bold');
        doc.text('GASTOS', pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;

        autoTable(doc, {
          startY: currentY,
          head: [['Categoría', 'Descripción', 'Fecha', 'Monto']],
          body: mapRows(gastos),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [239, 68, 68], textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          theme: 'striped',
          margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 4;
        doc.setFillColor(240);
        doc.rect(14, currentY, pageWidth - 28, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Gastos: ${formatMoney(totalExpense)}`, pageWidth - 38, currentY + 6, { align: 'right' });

        currentY += 12;
      }

      // ==== TABLA INGRESOS ====
      if (ingresos.length > 0) {
        doc.setLineWidth(0.5);
        doc.setDrawColor(150);
        doc.line(14, currentY, pageWidth - 14, currentY);
        currentY += 8;

        doc.setFont('helvetica', 'bold');
        doc.text('INGRESOS', pageWidth / 2, currentY, { align: 'center' });
        currentY += 6;

        autoTable(doc, {
          startY: currentY,
          head: [['Categoría', 'Descripción', 'Fecha', 'Monto']],
          body: mapRows(ingresos),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          theme: 'striped',
          margin: { left: 14, right: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 4;
        doc.setFillColor(240);
        doc.rect(14, currentY, pageWidth - 28, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Ingresos: ${formatMoney(totalIncome)}`, pageWidth - 38, currentY + 6, { align: 'right' });

        currentY += 12;
      }

      // ==== BALANCE FINAL ====
      doc.setLineWidth(0.5);
      doc.setDrawColor(0);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 10;

      doc.setFillColor(240);
      doc.rect(14, currentY, pageWidth - 28, 10, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Balance Final: ${formatMoney(balance)}`, pageWidth / 2, currentY + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal'); // opcional: volver a fuente normal si sigues escribiendo


      // ==== PIE DE PÁGINA (todas las páginas) ====
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerText = `Página ${i} de ${pageCount}`;
        const printDate = new Date().toLocaleDateString('es-CL');

        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Impreso el: ${printDate}`, 14, doc.internal.pageSize.getHeight() - 10);
        doc.text(footerText, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 10, {
          align: 'right'
        });
      }

      // ==== GUARDAR ====
      doc.save(`Transacciones_${fechaInicio}_a_${fechaFin}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Revisa la consola.');
    }
  };


  // ✅ Exportar a Excel


const exportToExcel = () => {
  const workbook = XLSX.utils.book_new();
  const pageTitle = `Transacciones — ${usuario || 'Usuario'}`;
  const fechaTexto = `Desde: ${fechaInicio} — Hasta: ${fechaFin}`;

  const gastos = transactions.filter(tx =>
    tx.type === 'expense' && tx.date >= fechaInicio && tx.date <= fechaFin
  );
  const ingresos = transactions.filter(tx =>
    tx.type === 'income' && tx.date >= fechaInicio && tx.date <= fechaFin
  );

  const mapRows = (arr) =>
    arr.map(tx => {
      const cat = categorias.find(c => c.id === tx.categoria);
      return {
        Categoría: cat?.nombre || 'Sin categoría',
        Descripción: tx.description,
        Fecha: new Date(tx.date).toLocaleDateString('es-CL'),
        Monto: parseFloat(tx.actual)
      };
    });

  const gastosData = mapRows(gastos);
  const ingresosData = mapRows(ingresos);

  // Calcular totales
  const totalGastos = gastos.reduce((acc, tx) => acc + parseFloat(tx.actual), 0);
  const totalIngresos = ingresos.reduce((acc, tx) => acc + parseFloat(tx.actual), 0);
  const balance = totalIngresos - totalGastos;

  // === Crear hoja y formato manual ===
  const sheetData = [
    [pageTitle],
    [fechaTexto],
    [],
    ['GASTOS'],
    ['Categoría', 'Descripción', 'Fecha', 'Monto'],
    ...gastosData.map(obj => Object.values(obj)),
    ['Total Gastos', '', '', totalGastos],
    [],
    ['INGRESOS'],
    ['Categoría', 'Descripción', 'Fecha', 'Monto'],
    ...ingresosData.map(obj => Object.values(obj)),
    ['Total Ingresos', '', '', totalIngresos],
    [],
    ['', '', 'BALANCE FINAL', balance]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Estilo básico de ancho
  worksheet['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }];

  // Agregar hoja al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen');

  // Guardar archivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), `Transacciones_${fechaInicio}_a_${fechaFin}.xlsx`);
};


  // ✅ Mostrar alerta si el balance es negativo y filtrar por fecha y categoría
  return (
    <div className="transactions-wrapper">
      <h2 className="transactions-title"><span role="img" aria-label="gráfico">📊</span> Transacciones</h2>

      {balance < 0 && (
        <div className="popup-alert">
          <span role="img" aria-label="alerta">⚠️</span> Tu balance está en negativo. ¡Has sobregirado tus gastos!
        </div>
      )}

  
      <div className="tx-date-filters">
        <label>Desde: </label>
        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        <label>Hasta: </label>
        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        <label>Filtrar por Categoría: </label>
        <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
          <option value="">Todas</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.icono} {cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="tx-export-buttons">
        <button className="tx-button export-pdf" onClick={exportToPDF}>
          <span role="img" aria-label="documento PDF">📄</span> Descargar PDF
        </button>
        <button className="tx-button export-excel" onClick={exportToExcel}>
          <span role="img" aria-label="gráfico de Excel">📊</span> Descargar Excel
        </button>
      </div>

      <div className="totals-row">
        <div className="total-gastos"><strong>Total Gastos:</strong> {formatMoney(totalExpense)}</div>
        <div className="total-ingresos"><strong>Total Ingresos:</strong> {formatMoney(totalIncome)}</div>
        <div className={balance >= 0 ? 'balance-positive' : 'balance-negative'}>
          <strong>Balance:</strong> {formatMoney(balance)}
        </div>
      </div>

      <div className="tx-add-button-wrapper">
        <button className="tx-button green" onClick={openCreateModal}>+ Agregar Transacción</button>
      </div>

      <div className="tx-columns">
        <div className="tx-section gastos">
          <h3 className="tx-formulario-title">Gastos</h3>
          <div className="tx-limit-selector">
            <label>Mostrar: </label>
            <select value={gastosToShow} onChange={e => setGastosToShow(parseInt(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="tx-scroll-area">
            {renderCards('expense', gastosToShow)}
          </div>
        </div>

        <div className="tx-section ingresos">
          <h3 className="tx-formulario-title">Ingresos</h3>
          <div className="tx-limit-selector">
            <label>Mostrar: </label>
            <select value={ingresosToShow} onChange={e => setIngresosToShow(parseInt(e.target.value))}>
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="tx-scroll-area">
            {renderCards('income', ingresosToShow)}
          </div>
        </div>
      </div>

      {showEditModal && editingTx && (
        <TransactionModal
          transaction={editingTx}
          categorias={categorias}
          onClose={closeEditModal}
          onSave={closeEditModal}
        />
      )}

      {showCreateModal && (
        <CreateTransactionModal
          categorias={categorias}
          onClose={closeCreateModal}
          onSave={closeCreateModal}
        />
      )}
    </div>
  );
}

export default Transactions;
