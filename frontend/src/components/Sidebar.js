// frontend/src/components/Sidebar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import logo from '../img/umg.png';

function Sidebar() {
    const [showExaminar, setShowExaminar] = useState(false);
    const [showConfiguraciones, setShowConfiguraciones] = useState(false);

    return (
        <div className="sidebar">
            <div className="logo">
                <img src={logo} alt="Logo UMG" />
            </div>
            <nav className="nav-menu">
                <h3 onClick={() => setShowExaminar(!showExaminar)}>
                    Examinar {showExaminar ? '-' : '+'}
                </h3>
                {showExaminar && (
                    <ul>
                        <li>Análisis de base de datos</li>
                        <li>Diagrama Entidad-Relación</li>
                        <li>Validación en tiempo real</li>
                        <li>Historial de cambios</li>
                    </ul>
                )}
                
                <h3 onClick={() => setShowConfiguraciones(!showConfiguraciones)}>
                    Configuraciones {showConfiguraciones ? '-' : '+'}
                </h3>
                {showConfiguraciones && (
                    <ul>
                        <li>
                            <Link to="/configuraciones/aspecto">Aspecto</Link>
                        </li>
                    </ul>
                )}
            </nav>
        </div>
    );
}

export default Sidebar;
