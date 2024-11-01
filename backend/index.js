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

// Nuevo endpoint para generar el diagrama ER
app.post('/generar_diagrama', (req, res) => {
    const { scriptSQL } = req.body;
    if (!scriptSQL) {
        return res.status(400).json({ error: 'No se ha proporcionado un script SQL.' });
    }

    const pythonProcess = spawn(PYTHON_COMMAND, ['scripts/generar_diagrama.py']);

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
            console.error(`Error en la generación del diagrama ER: ${errorMessage}`);
            res.status(500).json({ error: `Error en la generación del diagrama ER: ${errorMessage}` });
        } else {
            try {
                const parsedResult = JSON.parse(result);
                res.json({ diagramaER: `data:image/png;base64,${parsedResult.diagrama}`, mensaje: "Diagrama generado exitosamente" });
            } catch (error) {
                res.status(500).json({ error: 'Error al procesar la respuesta del diagrama ER' });
            }
        }
    });
});

// Inicia el servidor y lo mantiene encendido
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
