import { NavLink, useLocation } from 'react-router-dom';
import {
  ActionIcon,
  Center,
  Container,
  Group,
  Menu,
  Tooltip,
  rem,
  Box,
} from '@mantine/core';
import classes from './Header.module.css';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

const countries = [
  { value: 'mx', label: 'México', emoji: '🇲🇽', lang: 'es' },
  { value: 'us', label: 'Estados Unidos', emoji: '🇺🇸', lang: 'en' },
  { value: 'ar', label: 'Argentina', emoji: '🇦🇷', lang: 'es' },
  { value: 'co', label: 'Colombia', emoji: '🇨🇴', lang: 'es' },
  { value: 'es', label: 'España', emoji: '🇪🇸', lang: 'es' },
  { value: 'pe', label: 'Perú', emoji: '🇵🇪', lang: 'es' },
  { value: 'cl', label: 'Chile', emoji: '🇨🇱', lang: 'es' },
  { value: 've', label: 'Venezuela', emoji: '🇻🇪', lang: 'es' },
  { value: 'br', label: 'Brasil', emoji: '🇧🇷', lang: 'pt' },
  { value: 'ec', label: 'Ecuador', emoji: '🇪🇨', lang: 'es' },
  { value: 'gt', label: 'Guatemala', emoji: '🇬🇹', lang: 'es' },
  { value: 'bo', label: 'Bolivia', emoji: '🇧🇴', lang: 'es' },
  { value: 'do', label: 'República Dominicana', emoji: '🇩🇴', lang: 'es' },
  { value: 'hn', label: 'Honduras', emoji: '🇭🇳', lang: 'es' },
  { value: 'py', label: 'Paraguay', emoji: '🇵🇾', lang: 'es' },
  { value: 'sv', label: 'El Salvador', emoji: '🇸🇻', lang: 'es' },
  { value: 'ni', label: 'Nicaragua', emoji: '🇳🇮', lang: 'es' },
  { value: 'cr', label: 'Costa Rica', emoji: '🇨🇷', lang: 'es' },
  { value: 'pa', label: 'Panamá', emoji: '🇵🇦', lang: 'es' },
  { value: 'uy', label: 'Uruguay', emoji: '🇺🇾', lang: 'es' },
  { value: 'pr', label: 'Puerto Rico', emoji: '🇵🇷', lang: 'es' },
  { value: 'ca', label: 'Canadá', emoji: '🇨🇦', lang: 'en' },
  { value: 'de', label: 'Alemania', emoji: '🇩🇪', lang: 'de' },
  { value: 'fr', label: 'Francia', emoji: '🇫🇷', lang: 'fr' },
  { value: 'it', label: 'Italia', emoji: '🇮🇹', lang: 'it' },
  { value: 'gb', label: 'Reino Unido', emoji: '🇬🇧', lang: 'en' },
  { value: 'nl', label: 'Países Bajos', emoji: '🇳🇱', lang: 'nl' },
  { value: 'pt', label: 'Portugal', emoji: '🇵🇹', lang: 'pt' },
  { value: 'jp', label: 'Japón', emoji: '🇯🇵', lang: 'ja' },
  { value: 'kr', label: 'Corea del Sur', emoji: '🇰🇷', lang: 'ko' },
  { value: 'cn', label: 'China', emoji: '🇨🇳', lang: 'zh' },
  { value: 'in', label: 'India', emoji: '🇮🇳', lang: 'hi' },
  { value: 'ru', label: 'Rusia', emoji: '🇷🇺', lang: 'ru' },
  { value: 'au', label: 'Australia', emoji: '🇦🇺', lang: 'en' },
];


export function Header() {
  const { t, i18n } = useTranslation();

  // Detectar subdominio desde la URL
  const subdomain = window.location.hostname.includes('.') ? window.location.hostname.split('.')[0] : 'mx';
  const currentLang = subdomain === 'us' ? 'en' : 'es';

  // Forzar idioma desde subdominio
  useEffect(() => {
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [i18n, currentLang]);

  const location = useLocation();

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
        animate={link.highlight ? { scale: [1, 1.05, 1] } : false}
        transition={link.highlight ? { duration: 1.5, repeat: Infinity } : undefined}
        className={link.highlight ? classes.ledBorder : undefined}
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

          <Group
            gap={6}
            justify="flex-end"
            align="center"
            wrap="nowrap"
            style={{ flex: 1, overflowX: 'hidden' }} // CAMBIO: de 'auto' a 'hidden'
          >
            {items}
          </Group>

          {/* Menú de selección de país fuera del contenedor con scroll */}
          <Box
            onPointerDownCapture={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <Menu shadow="md" width={200} withinPortal position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  size="lg"
                  radius="xl"
                  variant="subtle"
                  style={{ fontSize: rem(24) }}
                >
                  {countries.find((c) => c.value === subdomain)?.emoji ?? '🇲🇽'}
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown
                style={{
                  maxHeight: rem(300),
                  overflowY: 'auto',
                }}
                onWheel={(e) => e.stopPropagation()}
              >
                {countries.map((country) => (
                  <Menu.Item
                    key={country.value}
                    leftSection={country.emoji}
                    onClick={() => {
                      const currentPath = window.location.pathname + window.location.search;
                      i18n.changeLanguage(country.lang);
                      window.location.href = `https://${country.value}.joingroups.pro${currentPath}`;
                    }}
                  >
                    {country.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>

            </Menu>
          </Box>

        </div>
      </Container>
    </header>
  );
}
