import React from 'react';

function Goals() {
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
      <h2>Metas de Ahorro</h2>
      <p>Configura tus metas financieras.</p>
    </div>
  );
}

export default Goals;
