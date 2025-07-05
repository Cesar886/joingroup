import { NavLink, useLocation } from 'react-router-dom';
import {
  ActionIcon,
  Center,
  Container,
  Group,
  Menu,
  Tooltip,
  rem,
} from '@mantine/core';
import classes from './Header.module.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language.startsWith('en') ? 'en' : 'es';
  const nextLang = currentLang === 'es' ? 'en' : 'es';
  const location = useLocation();

  const flagEmoji = nextLang === 'es' ? '🇺🇸' : '🇲🇽';
  const tooltipText = nextLang === 'es' ? 'Cambiar a español' : 'Switch to English';

  const isClanesSection = location.pathname.startsWith('/clanes');

  const links = [
    { link: '/', label: t('Inicio') },
    {
      link: isClanesSection ? '/clanes/form' : '/comunidades/form',
      label: isClanesSection ? t('Publica tu clan') : t('Publica Tu Grupo'),
      highlight: true,
    },
  ];

  const items = links.map((link) => {
    const navLink = (
      <NavLink
        key={link.link}
        to={link.link}
        className={({ isActive }) =>
          isActive ? `${classes.link} ${classes.active}` : classes.link
        }
      >
        {link.label}
      </NavLink>
    );

    return link.highlight ? (
      <motion.div
        key={link.link}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={classes.ledBorder}
      >
        {navLink}
      </motion.div>
    ) : (
      navLink
    );
  });

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
          <NavLink to="/" className={classes.logoLink}>
            <Group align="center" gap="xs" wrap="nowrap">
              <img
                src="/JoinGroups.png"
                alt="Join Group Logo"
                width={42}
                height={42}
                style={{ objectFit: 'contain' }}
              />
              <span className={classes.logoText}>JoinGroup</span>
            </Group>
          </NavLink>

          {/* Wrapper para navegación + idioma */}
            <Group
              gap={6}
              justify="flex-end"
              align="center"
              wrap="nowrap"
              style={{ flex: 1, overflowX: 'auto' }}
            >

            {items}

            <Tooltip label={tooltipText} withArrow>
              <ActionIcon
                size="lg"
                radius="xl"
                variant="subtle"
                onClick={() => {i18n.changeLanguage(nextLang); sessionStorage.setItem('lang', nextLang);}}
                style={{ fontSize: rem(24) }}
              >
                {flagEmoji}
              </ActionIcon>
            </Tooltip>
          </Group>
        </div>
      </Container>
    </header>
  );
}
