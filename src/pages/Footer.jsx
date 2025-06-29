import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
} from '@tabler/icons-react';
import {
  ActionIcon,
  Container,
  Group,
  Text,
  Stack,
  Flex,
  Image,
} from '@mantine/core';
import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './Footer.module.css';
import { Link } from 'react-router-dom';

const data = [
  {
    title: 'Sobre Nosotros',
    links: [
      {
        label: 'Contáctanos por WhatsApp',
        link: 'https://wa.me/528261308623?text=Hola,%20quiero%20más%20información',
      },
      { label: 'Términos y condiciones', link: '/terminos' },
      { label: 'Política de privacidad', link: '/privacidad' },
      { label: 'Acerca de JoinGroup', link: '/acerca' },
    ],
  },
  {
    title: 'Comunidad',
    links: [
      { label: 'Instagram Oficial', link: 'https://www.instagram.com/daniel110a/' },
      { label: 'Grupo en Telegram', link: 'https://t.me/Photosoficialbot' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={classes.footer}>
      <Container size="lg" className={classes.inner}>
        <Flex justify="space-between" direction={{ base: 'column', sm: 'row' }} gap="xl">
          <Stack spacing="xs" className={classes.logoWrapper}>
            <Image src="/JoinGroups.png" alt="Logo de JoinGroup" className={classes.logo}/>
            <Text size="sm" c="dimmed" className={classes.description} ta={{ base: 'center', sm: 'left' }}>
              JoinGroup es tu herramienta para administrar, automatizar y organizar grupos de Telegram de forma eficiente.
            </Text>
          </Stack>

          <Flex wrap="wrap" gap="xl" justify={{ base: 'center', sm: 'flex-end' }}>
            {data.map((group) => (
              <div key={group.title}>
                <Text className={classes.title}>{group.title}</Text>
                <Stack spacing={4}>
                  {group.links.map((link) => {
                    const isExternal = link.link.startsWith('http') || link.link.startsWith('mailto');
                    return isExternal ? (
                      <Text
                        key={link.label}
                        className={classes.link}
                        component="a"
                        href={link.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </Text>
                    ) : (
                      <Text
                        key={link.label}
                        className={classes.link}
                        component={Link}
                        to={link.link}
                      >
                        {link.label}
                      </Text>
                    );
                  })}
                </Stack>
              </div>
            ))}
          </Flex>
        </Flex>
      </Container>

      <Container size="lg" className={classes.afterFooter} mt="xl">
        <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap="sm">
          <Text c="dimmed" size="sm">
            © {new Date().getFullYear()} joingroups.pro. Todos los derechos reservados.
          </Text>

          <Group gap={8} className={classes.social} wrap="nowrap">
            <a href="https://www.instagram.com/daniel110a/" target="_blank" rel="noopener noreferrer">
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandInstagram size={18} stroke={1.5} />
              </ActionIcon>
            </a>
          </Group>
        </Flex>
      </Container>
    </footer>
  );
}