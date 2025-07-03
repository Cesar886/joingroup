// Home.jsx
import {
  Title,
  Text,
  Button,
  Container,
  Image,
  Stack,
  Group,
  Box,
  Center,
  Divider,
  Paper,
  Table,
} from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import {
  IconFlame,
  IconTrendingUp,
  IconCrown,
  IconStar,
  IconNews,
  IconBolt,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import styles from './Home.module.css';
import { useEffect, useState, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import slugify from '../assets/slugify';

const featuredButtons = [
  {
    to: '/comunidades/grupos-de-telegram?orden=top',
    label: 'Top grupos de Telegram',
    icon: <IconFlame size={18} />, color: 'cyan',
  },
  {
    to: '/comunidades?orden=top',
    label: 'Más vistos',
    icon: <IconTrendingUp size={18} />, color: 'orange',
  },
  {
    to: '/clanes/clanes-de-clash-royale',
    label: 'Clanes de Clash Royale',
    icon: <IconCrown size={18} />, color: 'pink',
  },
  {
    to: '/comunidades/grupos-de-whatsapp?orden=top',
    label: 'Top grupos de WhatsApp',
    icon: <IconStar size={18} />, color: 'teal',
  },
  {
    to: '/comunidades?orden=nuevos',
    label: 'Nuevos grupos',
    icon: <IconNews size={18} />, color: 'cyan',
  },
  {
    to: '/clanes/clanes-de-clash-of-clans',
    label: 'Clanes Clash of Clans',
    icon: <IconStar size={18} />, color: 'pink',
  },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [clanes, setClanes] = useState([]);
  const baseLang = i18n.language.split('-')[0];
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [buttonPosition, setButtonPosition] = useState('top-left');
  const positionRef = useRef('top-left');

  useEffect(() => {
    const fetchData = async () => {
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      const allGroups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      //Controlar el Preview de los grupos
      const destacadosGroups = allGroups.filter(g => g.destacado).slice(0, 1);
      const masVistosGroups = [...allGroups].sort((a, b) => b.visitas - a.visitas).slice(0, 4);
      setGroups([...destacadosGroups, ...masVistosGroups]);

      const clanesSnapshot = await getDocs(collection(db, 'clanes'));
      const allClanes = clanesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      //Controlar el Preview de los clanes
      const destacadosClanes = allClanes.filter(c => c.destacado).slice(0, 1);
      const masVistosClanes = [...allClanes].sort((a, b) => b.visitas - a.visitas).slice(0, 4);
      setClanes([...destacadosClanes, ...masVistosClanes]);

    };
    fetchData();
  }, []);

  useEffect(() => {
    const positions = ['top-left', 'bottom-right', 'top-right', 'bottom-left'];

    const changePosition = () => {
      let next;
      do {
        next = positions[Math.floor(Math.random() * positions.length)];
      } while (next === positionRef.current); // evitar repetir la misma

      setButtonPosition(next);
      positionRef.current = next;
    };

    const interval = setInterval(changePosition, 10000);
    return () => clearInterval(interval);
  }, []);


  const renderCard = (row, idx, isGroup = true) => {
    const slug = row.slug || slugify(row.name);
    const iconSrc = isGroup
      ? (row.tipo?.trim().toLowerCase() === 'telegram' ? '/telegramicons.png' : '/wapp.webp')
      : (row.tipo === 'clash-royale' ? '/clashRoyaleFondo1.png' : '/clashOfClansFondo.png');

    const descriptionText =
      typeof row.description === 'object'
        ? row.description[baseLang] || row.description[i18n.language] || row.description['es']
        : row.description;

    return (
      <Paper
        key={`${row.id}-${idx}`}
        withBorder
        radius="md"
        shadow="xs"
        onClick={() => navigate(`/${isGroup ? 'comunidades/grupos-de' : 'clanes/clanes-de'}-${row.tipo}/${slug}`)}
        style={{ cursor: 'pointer' }}
      >
        <Table withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <Group justify="space-between">
                  <Text fw={600}>{row.name}</Text>
                  <img src={iconSrc} alt={row.name} width={24} height={24} />
                </Group>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <Text size={isMobile ? 'xs' : 'sm'} c="dimmed" lineClamp={isMobile ? 1 : 2}>{descriptionText}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>
    );
  };

  const floatingStyle = (position) => {
    const common = {
      position: 'fixed',
      zIndex: 1000,
      animation: 'pulse 1.5s infinite',
    };

    switch (position) {
      case 'top-left':
        return { ...common, top: '60px', left: '20px' };
      case 'bottom-right':
        return { ...common, bottom: '20px', right: '20px' };
      case 'top-right':
        return { ...common, top: '60px', right: '20px' };
      case 'bottom-left':
        return { ...common, bottom: '20px', left: '20px' };
      default:
        return common;
    }
  };


  return (
    <Container size="md" py="xl">
      <Stack align="center" spacing="lg">
        <Title order={1} ta="center">Encuentra los mejores grupos de Telegram y clanes de juegos</Title>
        <Text ta="center" c="dimmed" fz="md" maw={700}>
          En <strong>JoinGroups.pro</strong> conectamos usuarios con comunidades activas en Telegram, WhatsApp, Discord y juegos como Clash Royale. Todo en un solo lugar.
        </Text>
        <Button size="lg" color="blue" component={Link} to="/comunidades">
          Explorar grupos ahora
        </Button>
      </Stack>

      <Box className={styles['scrolling-container']} mt="xl">
        <div className={styles['scrolling-track']}>
          {[...featuredButtons, ...featuredButtons].map((b, i) => (
            <Button
              key={i}
              component={Link}
              to={b.to}
              leftSection={b.icon}
              variant="light"
              color={b.color}
              style={{ whiteSpace: 'nowrap', pointerEvents: 'auto', flexShrink: 0 }}
            >
              {b.label}
            </Button>
          ))}
        </div>
      </Box>

      <Paper mt="xl" withBorder shadow="sm" p="md" radius="lg">
        <Title order={2} mb="sm">🎯 Grupos populares y destacados</Title>
        <Stack>
          {groups.map((group, i) => renderCard(group, i, true))}
        </Stack>
        <Center mt="md">
          <Button variant="light" component={Link} to="/comunidades">
            Ver todos los grupos
          </Button>
        </Center>
      </Paper>

      <Paper mt="xl" withBorder shadow="sm" p="md" radius="lg">
        <Title order={2} mb="sm">🛡️ Clanes destacados y con más vistas</Title>
        <Stack>
          {clanes.map((clan, i) => renderCard(clan, i, false))}
        </Stack>
        <Center mt="md">
          <Button variant="light" component={Link} to="/clanes">
            Ver todos los clanes
          </Button>
        </Center>
      </Paper>

      <Box mt="xl">
        <Divider my="lg" />
        <Title order={2} mb="xs">📢 Únete a las comunidades más activas del momento</Title>
        <Text fz="sm" c="dimmed" mb="sm">
          En JoinGroups, no solo encuentras enlaces. Encuentras conexiones reales. Con miles de grupos verificados y organizados por categoría, JoinGroups se ha convertido en la plataforma líder para descubrir comunidades de Telegram, WhatsApp, Discord y videojuegos.
        </Text>
        <Text fz="sm" c="dimmed" mb="sm">
          🚀 Optimizado para SEO, fácil de navegar y 100% gratuito, nuestro sitio se actualiza constantemente para brindarte las mejores recomendaciones. Explora grupos NSFW, anime, estudios, música, tecnología y más.
        </Text>
        <Text fz="sm" c="dimmed">
          🔒 Tu privacidad es importante. No recolectamos tus datos y todos los enlaces que compartimos están previamente revisados. Ya seas creador o explorador, estás en el lugar correcto.
        </Text>
        <Center mt="xl">
          <Button component={Link} to="/comunidades/form" color="teal" size="lg">
            Publica tu grupo ahora
          </Button>
        </Center>
      </Box>

      {/* Botón flotante con cambio de posición */}
      <Button
        component={Link}
        to="/comunidades/form"
        color="pink"
        size="sm"
        radius="xl"
        className={styles['floating-publish-button']}
        style={{
          ...floatingStyle(buttonPosition),
        }}
      >
        🎉 Publica tu grupo gratis
      </Button>

    </Container>
  );
}
