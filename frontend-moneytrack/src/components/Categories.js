import React from 'react';

function Categories() {
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
      <h2>Categorías</h2>
      <p>Organiza tus gastos por categoría.</p>
    </div>
  );
}

export default Categories;
