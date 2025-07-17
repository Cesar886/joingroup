// components/ThemeToggle.jsx
import { ActionIcon } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ThemeToggle({ colorScheme, toggleColorScheme }) {
  const dark = colorScheme === 'dark';

  return (
    <ActionIcon
      variant="filled"
      color={dark ? 'yellow' : 'blue'}
      onClick={toggleColorScheme}
      radius="xl"
      size="lg"
      title="Cambiar tema"
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
      }}
    >
      {dark ? <IconSun size="1.1rem" /> : <IconMoon size="1.1rem" />}
    </ActionIcon>
  );
}
