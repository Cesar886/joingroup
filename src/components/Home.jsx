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
      const masNuevosGroups = [...allGroups]
        .filter(g => g.createdAt)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 4);
      setGroups([...destacadosGroups, ...masNuevosGroups]);

      const clanesSnapshot = await getDocs(collection(db, 'clanes'));
      const allClanes = clanesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      //Controlar el Preview de los clanes
      const destacadosClanes = allClanes.filter(c => c.destacado).slice(0, 1);
      const masNuevosClanes = [...allClanes]
        .filter(c => c.createdAt)
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
        .slice(0, 4);
      setClanes([...destacadosClanes, ...masNuevosClanes]);

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
    <Stack align="center" spacing="lg" px="md">
      <Title
        order={1}
        ta="center"
        fw={isMobile ? 600 : 800}
        fz={isMobile ? 28 : 36} // puedes ajustar estos valores según tu diseño
      >
        {isMobile
          ? 'Grupos de Telegram, WhatsApp y Juegos'
          : 'Los mejores Grupos de Telegram, WhatsApp y Clanes de Juegos Activos'}
      </Title>


      <Text ta="center" c="dimmed" fz="md" maw={700} mx="auto">
        {isMobile
          ? 'Únete a comunidades en Telegram, WhatsApp y juegos populares.'
          : (
              <>
                En <strong>JoinGroups.pro</strong> puedes unirte fácilmente a comunidades populares en <strong>Telegram</strong>, <strong>WhatsApp</strong>, <strong>Discord</strong> y juegos como <strong>Clash Royale</strong>. Explora grupos organizados por temas, idiomas y más.
              </>
            )}
      </Text>
      <Button
        size="lg"
        color="blue"
        component={Link}
        variant="light"
        radius="lg"
        to="/comunidades"
        style={{ fontWeight: 600 }}
      >
        Explorar Grupos Populares
      </Button>
    </Stack>


      <Box className={styles['scrolling-container']} mt="xl" maw={700}>
        <div className={styles['scrolling-track']}>
          {[...featuredButtons, ...featuredButtons].map((b, i) => (
            <Button
              key={i}
              component={Link}
              to={b.to}
              leftSection={b.icon}
              variant="light"
              radius='xl'
              color={b.color}
              style={{ whiteSpace: 'nowrap', pointerEvents: 'auto', flexShrink: 0 }}
            >
              {b.label}
            </Button>
          ))}
        </div>
      </Box>

      <Paper mt="xl" withBorder shadow="sm" p="md" radius="lg">
        <Title order={2} mb="sm" fz={isMobile ? 20 : 26}>{isMobile ? '🎯 Grupos nuevos' : '🎯 Grupos nuevos y destacados'}</Title>
        <Stack>
          {groups.map((group, i) => renderCard(group, i, true))}
        </Stack>
        <Center mt="md">
          <Button variant="light" component={Link} radius="md" to="/comunidades">
            Ver todos los grupos
          </Button>
        </Center>
      </Paper>

      <Paper mt="xl" withBorder shadow="sm" p="md" radius="lg">
        <Title order={2} mb="sm" fz={isMobile ? 20 : 26}>{isMobile ? '🏆 Clanes destacados' : '🏆 Clanes destacados y con más vistas'}</Title>
        <Stack>
          {clanes.map((clan, i) => renderCard(clan, i, false))}
        </Stack>
        <Center mt="md">
          <Button variant="light" component={Link} radius="md" to="/clanes" color='violet'>
            Ver todos los clanes
          </Button>
        </Center>
      </Paper>

      <Center mt="xl">
        <Button component={Link} to="/clanes/form" variant='light' color="violet" size="lg" radius='lg'>
          Publica tu CLAN ahora
        </Button>
      </Center>

      <Box mt="xl" mx="auto" style={isMobile ? { textAlign: 'center' } : {}}>
        <Divider my="lg" />
        <Title order={2} mb="xs">Únete a los mejores grupos y canales de Telegram, WhatsApp y más</Title>

        <Text fz="sm" c="dimmed" mb="sm">
          ¿Quieres encontrar un <strong>grupo</strong> o <strong>canal</strong> activo en <strong>Telegram</strong>, <strong>WhatsApp</strong> o incluso juegos? En <strong>JoinGroups</strong> puedes <strong>descubrir, conocer</strong> y unirte fácilmente a miles de <strong>grupos</strong> clasificados por temática, país y número de <strong>miembros</strong>. 
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          Nuestra plataforma te ayuda a encontrar <strong>canales</strong> de calidad en categorías como anime, música, desarrollo, amistad, NSFW, salud, IA, memes y más. Todos los <strong>grupos</strong> son verificados y contienen contenido actualizado.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          <strong>JoinGroups</strong> ha sido diseñado para que <strong>puedas</strong> navegar rápidamente, desde cualquier dispositivo, ya sea <strong>Android</strong> o PC. Utiliza nuestros filtros inteligentes por idioma, país o tipo de <strong>contenido</strong> para encontrar exactamente lo que buscas.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          Si eres creador, también puedes <strong>crear</strong> tu propio <strong>grupo</strong> y publicarlo gratis. Miles de <strong>usuarios</strong> buscan comunidades nuevas cada día, así que no pierdas la oportunidad de hacer crecer la tuya.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          En <strong>JoinGroups</strong> priorizamos la seguridad: no recopilamos datos personales y verificamos cada enlace manualmente. Nuestra misión es ayudarte a <strong>conectar</strong> con <strong>personas</strong> reales y comunidades auténticas, sin spam.
        </Text>

        <Text fz="sm" c="dimmed">
          Ya sea que quieras hacer nuevos amigos, aprender algo nuevo o simplemente pasar el rato, aquí encontrarás la <strong>forma</strong> más fácil de acceder a las mejores comunidades. Incluso si vienes desde <strong>Google</strong>, te damos la bienvenida a JoinGroups.
        </Text>
      </Box>




      {/* Botón flotante con cambio de posición */}
      <Button
        component={Link}
        to="/comunidades/form"
        color="red"
        size="sm"
        variant='light'
        radius="xl"
        className={styles['floating-publish-button']}
        style={{
          ...floatingStyle(buttonPosition),
        }}
      >
        Publica tu grupo gratis !!
      </Button>

      <Button
        variant="outline"
        color="blue"
        mt='xl'
        component="a"
        href="https://wa.me/5212284935831?text=Hola,%20tengo%20un%20problema%20para%20publicar%20mi%20grupo%20en%20JoinGroups"
        target="_blank"
        rel="noopener noreferrer"
        fullWidth
      >
        {t('¿Tienes problemas? O quisieras sugerir un cambio en la página? Escríbenos por WhatsApp')}
      </Button>
    </Container>
  );
}
