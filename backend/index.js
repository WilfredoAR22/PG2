require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || 'python3';

app.use(cors());
app.use(express.json());

// Endpoint para analizar redundancia y duplicidad
app.post('/analizar', (req, res) => {
    const { scriptSQL } = req.body;
    if (!scriptSQL) {
        return res.status(400).json({ error: 'No se ha proporcionado un script SQL.' });
    }

    // Ejecutar el script de Python
    const pythonProcess = spawn(PYTHON_COMMAND, ['scripts/analizar_script.py']);

    pythonProcess.stdin.write(JSON.stringify({ scriptSQL }));
    pythonProcess.stdin.end();

    let result = '';
    let errorMessage = '';

    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorMessage += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Error en el análisis de redundancia: ${errorMessage}`);
            res.status(500).json({ error: `Error en el análisis de redundancia: ${errorMessage}` });
        } else {
            try {
                const parsedResult = JSON.parse(result);
                res.json(parsedResult);
            } catch (error) {
                res.status(500).json({ error: 'Error al procesar la respuesta del análisis' });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
