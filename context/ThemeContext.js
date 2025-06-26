import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  background: '#fff',
  text: '#000',
  secondaryText: '#666',
  border: '#ccc',
  dot: '#007AFF',
};

const darkTheme = {
  mode: 'dark',
  background: '#000',
  text: '#fff',
  secondaryText: '#ccc',
  border: '#444',
  dot: '#00aaff',
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(value => {
      const isDark = value === 'true';
      setDarkMode(isDark);
      setTheme(isDark ? darkTheme : lightTheme);
    });
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    setTheme(newValue ? darkTheme : lightTheme);
    AsyncStorage.setItem('darkMode', newValue.toString());
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
