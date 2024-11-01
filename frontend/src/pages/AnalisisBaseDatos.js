import React, { useState } from 'react';
import axios from 'axios';
import './AnalisisBaseDatos.css';

function AnalisisBaseDatos() {
  const [sqlContent, setSqlContent] = useState('');
  const [diagrama, setDiagrama] = useState('');
  const [alertas, setAlertas] = useState([]);
  const [mostrarDiagrama, setMostrarDiagrama] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setSqlContent(e.target.result);
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    try {
        // Llamada al endpoint para generar el diagrama
        const diagramaResponse = await axios.post('http://localhost:3000/generar_diagrama', { scriptSQL: sqlContent });
        const { diagramaER, mensaje: mensajeDiagrama } = diagramaResponse.data;
        
        setDiagrama(diagramaER);
        setMostrarDiagrama(true);

        // Llamada al endpoint para analizar redundancia y duplicidad
        const analizarResponse = await axios.post('http://localhost:3000/analizar', { scriptSQL: sqlContent });
        const { advertencias, mensaje: mensajeAnalisis } = analizarResponse.data;

        // Procesa las advertencias, muestra el mensaje si no hay advertencias
        setAlertas(advertencias.length ? advertencias : [mensajeAnalisis || "No se encontraron advertencias."]);
    } catch (error) {
        console.error("Error al analizar el script:", error);
        setAlertas(["Error al analizar el script SQL."]);
    }
  };


  const handleClear = () => {
    setSqlContent('');
    setDiagrama('');
    setAlertas([]);
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
            {diagrama ? (
              <img src={diagrama} alt="Diagrama Entidad-Relación" className="diagrama-imagen" />
            ) : (
              <p>Diagrama generado aquí</p>
            )}
            <button className="modificar-btn">Modificar</button>
          </div>
          <div className="alertas">
            <h3>Advertencias</h3>
            <ul className="alertas-lista">
              {alertas.map((alerta, index) => (
                <li key={index}>{alerta}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalisisBaseDatos;
