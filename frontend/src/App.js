import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Aspecto from './pages/Aspecto';
import AnalisisBaseDatos from './components/AnalisisBaseDatos';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import './App.css';

function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <ThemeProvider>
      <Router>
        <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
          <Sidebar />
          <div className={`main-content ${isDarkMode ? 'dark-mode' : ''}`}>
            <Routes>
              <Route path="/configuraciones/aspecto" element={<Aspecto />} />
              <Route path="/analisis" element={<AnalisisBaseDatos />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
