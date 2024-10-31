import React, { useState } from 'react';
import axios from 'axios';

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

  const handleAnalyze = async () => {
    try {
      const response = await axios.post('http://localhost:3000/analizar', { scriptSQL: sqlContent });
      const { redundancias, duplicidades, mensaje } = response.data;
  
      setDiagrama("Diagrama generado aquí"); // Coloca el diagrama real si el backend lo retorna
      setAlertas(
        mensaje + "\n" +
        (redundancias.length > 0 ? `Redundancias encontradas: ${JSON.stringify(redundancias)}` : "No se encontraron redundancias") + "\n" +
        (duplicidades.length > 0 ? `Duplicidades encontradas: ${JSON.stringify(duplicidades)}` : "No se encontraron duplicidades")
      );
    } catch (error) {
      console.error("Error al analizar el script:", error);
      setAlertas("Error al analizar el script SQL.");
    }
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
