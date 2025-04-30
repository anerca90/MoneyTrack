import React from 'react';

function Alerts() {
  const styles = {
    container: {
      marginLeft: '20px',
      padding: '30px',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }
  };

  return (
    <div style={styles.container}>
      <h2>Alertas</h2>
      <p>Notificaciones por límites de gasto.</p>
    </div>
  );
}

export default Alerts;
