import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

function Aspecto() {
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div>
      <h2>Configuraciones - Aspecto</h2>
      <label>
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
        Activar Modo Oscuro
      </label>
    </div>
  );
}

export default Aspecto;

