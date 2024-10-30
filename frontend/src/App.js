import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Aspecto from './pages/Aspecto';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/configuraciones/aspecto" element={<Aspecto />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

