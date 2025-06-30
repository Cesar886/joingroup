import { NavLink } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import { Center, Container, Group, Menu } from '@mantine/core';
import classes from './Header.module.css';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';




export function Header() {
  const { t, i18n } = useTranslation();
  const links = [
    { link: '/', label: t('Inicio (header)') },
    { link: '/form', label: t('Publica Tu Grupo'), highlight: true },
  ];

  const items = links.map((link) => {
    const menuItems = link.links?.map((item) => (
      <Menu.Item key={item.link}>
        <NavLink
          to={item.link}
          className={({ isActive }) =>
            isActive ? `${classes.link} ${classes.active}` : classes.link
          }
        >
          {item.label}
        </NavLink>
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu
          key={link.label}
          trigger="hover"
          transitionProps={{ exitDuration: 0 }}
          withinPortal
        >
          <Menu.Target>
            <span className={classes.link}>
              <Center>
                <span className={classes.linkLabel}>{link.label}</span>
                <IconChevronDown size={14} stroke={1.5} />
              </Center>
            </span>
          </Menu.Target>
          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

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

    // Agregar animación solo al botón destacado
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
            <Group align="center" gap="xs" style={{ textDecoration: 'none' }}>
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

          <Group gap={4}>{items}</Group>
          <button onClick={() => i18n.changeLanguage('en')}>English</button>
          <button onClick={() => i18n.changeLanguage('es')}>Español</button>
        </div>
      </Container>
    </header>
  );
}
