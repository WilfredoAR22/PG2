import React, { useState } from 'react';
import axios from 'axios';
import './AnalisisBaseDatos.css';

function AnalisisBaseDatos() {
  const [sqlContent, setSqlContent] = useState('');
  const [diagrama, setDiagrama] = useState('');
  const [alertas, setAlertas] = useState('');
  const [mostrarDiagrama, setMostrarDiagrama] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setSqlContent(e.target.result);
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    try {
      const response = await axios.post('http://localhost:3000/analizar', { scriptSQL: sqlContent });
      const { redundancias, duplicidades, mensaje } = response.data;

      setDiagrama("Diagrama generado aquí"); // Cambiar cuando el backend retorne el diagrama
      setAlertas(mensaje || "No se encontraron advertencias.");
      setMostrarDiagrama(true);
    } catch (error) {
      console.error("Error al analizar el script:", error);
      setAlertas("Error al analizar el script SQL.");
    }
  };

  const handleClear = () => {
    setSqlContent('');
    setDiagrama('');
    setAlertas('');
    setMostrarDiagrama(false);
  };

  return (
    <div className="analisis-container">
      <h2 className="titulo">Análisis de base de datos</h2>
      <button className="cargar-archivo" onClick={() => document.getElementById('fileInput').click()}>Cargar Archivo</button>
      <input 
        type="file" 
        id="fileInput" 
        style={{ display: 'none' }} 
        onChange={handleFileUpload}
        accept=".sql"
      />
      <textarea 
        className="script-textarea"
        value={sqlContent} 
        onChange={(e) => setSqlContent(e.target.value)} 
        placeholder="Script SQL"
      />
      <div className="buttons">
        <button className="analizar-btn" onClick={handleAnalyze}>Analizar</button>
        <button className="limpiar-btn" onClick={handleClear}>Limpiar</button>
      </div>
      {mostrarDiagrama && (
        <div className="resultados">
          <div className="diagrama-container">
            <textarea className="diagrama-textarea" value={diagrama} readOnly />
            <button className="modificar-btn">Modificar</button>
          </div>
          <div className="alertas">
            <h3>Advertencias</h3>
            <textarea className="alertas-textarea" value={alertas} readOnly />
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalisisBaseDatos;


