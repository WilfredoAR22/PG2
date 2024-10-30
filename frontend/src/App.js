import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [scriptSQL, setScriptSQL] = useState('');
    const [result, setResult] = useState(null);

    const handleAnalyze = async () => {
        try {
            const response = await axios.post('http://localhost:3000/analizar', { scriptSQL });
            setResult(response.data);
        } catch (error) {
            setResult({ error: 'Error al analizar el script SQL.' });
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>SQL Analyzer</h1>
            <textarea
                value={scriptSQL}
                onChange={(e) => setScriptSQL(e.target.value)}
                placeholder="Escribe tu script SQL aquí..."
                rows={10}
                cols={50}
                style={{ marginBottom: '10px', width: '100%' }}
            ></textarea>
            <br />
            <button onClick={handleAnalyze}>Analizar</button>
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h2>Resultado del Análisis</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
