// components/ThemeToggleProvider.jsx
import { useState } from 'react';
import {
  MantineProvider,
  localStorageColorSchemeManager,
} from '@mantine/core';
import ThemeToggle from './ThemeToggle';

const colorSchemeManager = localStorageColorSchemeManager();

export default function ThemeToggleProvider({ children }) {
  const [colorScheme, setColorScheme] = useState(colorSchemeManager.get());

  const toggleColorScheme = (value) => {
    const next = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(next);
    colorSchemeManager.set(next);
  };

  return (
    <MantineProvider
      theme={{ colorScheme }}
      defaultColorScheme={colorScheme}
      colorSchemeManager={colorSchemeManager}
    >
      {children}
      <ThemeToggle
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      />
    </MantineProvider>
  );
}
