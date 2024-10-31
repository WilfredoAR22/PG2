import React, { useState } from 'react';

function AnalisisBaseDatos() {
  const [sqlContent, setSqlContent] = useState('');
  const [diagrama, setDiagrama] = useState('');
  const [alertas, setAlertas] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setSqlContent(e.target.result);
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    // Lógica de análisis, por ahora es un ejemplo vacío
    setDiagrama("Diagrama generado aquí");
    setAlertas("Alertas de inconsistencia o duplicidad aquí");
  };

  const handleClear = () => {
    setSqlContent('');
    setDiagrama('');
    setAlertas('');
  };

  return (
    <div className="analisis-container">
      <h2>Análisis de base de datos</h2>
      <button onClick={() => document.getElementById('fileInput').click()}>Cargar Archivo</button>
      <input 
        type="file" 
        id="fileInput" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload}
        accept=".sql"
      />
      <textarea 
        value={sqlContent} 
        onChange={(e) => setSqlContent(e.target.value)} 
        placeholder="Escribe o carga el script SQL aquí"
      />
      <div className="buttons">
        <button onClick={handleAnalyze}>Analizar</button>
        <button onClick={handleClear}>Limpiar</button>
      </div>
      <div className="results">
        <div className="diagrama">
          <h3>Diagrama Entidad-Relación</h3>
          <textarea value={diagrama} readOnly />
        </div>
        <div className="alertas">
          <h3>Advertencias</h3>
          <textarea value={alertas} readOnly />
        </div>
      </div>
    </div>
  );
}

export default AnalisisBaseDatos;
