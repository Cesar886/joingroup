import { NavLink } from 'react-router-dom';
import { IconChevronDown } from '@tabler/icons-react';
import { Center, Container, Group, Menu } from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Header.module.css';

const links = [
    { link: '/', label: 'Inicio' },
    { link: '/form', label: 'Publicar Grupo' },
];


export function Header() {

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
        <Menu key={link.label} trigger="hover" transitionProps={{ exitDuration: 0 }} withinPortal>
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

    return (
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
  });

  return (
    <header className={classes.header}>
      <Container size="md">
        <div className={classes.inner}>
          <NavLink to="/" className={classes.logoLink}>
            <Group align="center" gap="xs" style={{ textDecoration: 'none' }}>
              <img
                src="/JoinGroup.svg"
                alt="Join Group Logo"
                width={42}
                height={42}
                style={{ objectFit: 'contain' }}
              />
              <span className={classes.logoText}>JoinGroup</span>
            </Group>
          </NavLink>

          <Group gap={4}>
            {items}
          </Group>

        </div>
      </Container>
    </header>
  );
}
