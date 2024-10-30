import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Aspecto from './pages/Aspecto';
import { ThemeContext } from './context/ThemeContext';

function App() {
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  return (
    <Router>
      <div className="App">
        <Sidebar />
        <Routes>
          <Route path="/configuraciones/aspecto" element={<Aspecto />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


