import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const Aspecto = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="aspecto-page">
      <h2>Configuraciones</h2>
      <div className="theme-toggle">
        <span>Activar modo oscuro</span>
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
      </div>
    </div>
  );
};

export default Aspecto;


