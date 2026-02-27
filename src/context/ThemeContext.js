import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const COLORS = {
  light: {
    background:    '#f9f9f9',
    card:          '#ffffff',
    text:          '#1a1a1a',
    subtext:       '#888888',
    border:        '#e0e0e0',
    divider:       '#f0f0f0',
    input:         '#fafafa',
    inputBorder:   '#e0e0e0',
    placeholder:   '#aaaaaa',
    purple:        '#6C63FF',
    success:       '#2e7d32',
    successBg:     '#f0fdf4',
    successBorder: '#bbf7d0',
    error:         '#cc0000',
    errorBg:       '#fff0f0',
    errorBorder:   '#ffcccc',
    danger:        '#FF4D4D',
    headerText:    '#ffffff',
    shadow:        '#000000',
  },
  dark: {
    background:    '#0f0f0f',
    card:          '#1e1e1e',
    text:          '#f1f1f1',
    subtext:       '#aaaaaa',
    border:        '#333333',
    divider:       '#2a2a2a',
    input:         '#2a2a2a',
    inputBorder:   '#444444',
    placeholder:   '#666666',
    purple:        '#8b85ff',
    success:       '#4caf50',
    successBg:     '#1a2e1a',
    successBorder: '#2e5e2e',
    error:         '#ff6b6b',
    errorBg:       '#2e1a1a',
    errorBorder:   '#5e2e2e',
    danger:        '#ff6b6b',
    headerText:    '#ffffff',
    shadow:        '#000000',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('darkMode');
        if (saved !== null) setIsDark(JSON.parse(saved));
      } catch (e) {
        console.log('Theme load error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Toggle dark mode
  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
  };

  const colors = isDark ? COLORS.dark : COLORS.light;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);