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
    <Stack align="center" spacing="lg" px="md">
      <Title order={1} ta="center" fw={800}>
        Descubre Grupos de Telegram, WhatsApp y Clanes de Juegos Activos
      </Title>
      <Text ta="center" c="dimmed" fz="md" maw={700}>
        En <strong>JoinGroups.pro</strong> puedes unirte fácilmente a comunidades populares en <strong>Telegram</strong>, <strong>WhatsApp</strong>, <strong>Discord</strong> y juegos como <strong>Clash Royale</strong>. Explora grupos organizados por temas, idiomas y más.
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


      <Box className={styles['scrolling-container']} mt="xl">
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

      <Center mt="xl">
        <Button component={Link} to="/clanes/form" variant='light' color="teal" size="lg">
          Publica tu CLAN ahora
        </Button>
      </Center>
      <Box mt="xl">
        <Divider my="lg" />
        <Title order={2} mb="xs">📢 Únete a las comunidades más activas del momento</Title>
        
        <Text fz="sm" c="dimmed" mb="sm">
          ¿Buscas comunidades auténticas y activas en las plataformas más populares? En <strong>JoinGroups</strong> lo hacemos fácil. Accede a miles de <strong>grupos de Telegram, WhatsApp, Discord y videojuegos</strong> cuidadosamente organizados por temática, país y nivel de actividad. No pierdas tiempo con enlaces rotos o comunidades vacías.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          🌍 Nuestra plataforma está diseñada para ayudarte a descubrir grupos que realmente aportan valor. Ya sea que te interesen <strong>grupos de anime, NSFW, música, criptomonedas, desarrollo web, IA, estudios, salud, memes</strong> o cualquier otra categoría, tenemos algo para ti. 
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          🚀 JoinGroups está <strong>100% optimizado para SEO</strong>, es rápido, intuitivo y completamente gratuito. Actualizamos nuestra base de datos a diario, destacando siempre los grupos más populares y relevantes para que no te pierdas lo mejor.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          🧠 Gracias a nuestro sistema de organización inteligente, puedes filtrar por <strong>idioma, país, temática y número de miembros</strong>, garantizando que encuentres exactamente lo que estás buscando. Además, nuestros <strong>grupos destacados</strong> han sido seleccionados por nuestra comunidad y moderadores.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          🔒 Tu privacidad es una prioridad. No recopilamos datos personales ni compartimos información con terceros. Todos los enlaces publicados son verificados manualmente para ofrecerte una experiencia segura y libre de spam.
        </Text>

        <Text fz="sm" c="dimmed" mb="sm">
          👥 ¿Tienes una comunidad y quieres hacerla crecer? Publica tu grupo fácilmente y llega a miles de usuarios interesados en tu contenido. En JoinGroups apoyamos tanto a <strong>creadores como exploradores</strong> de comunidades.
        </Text>

        <Text fz="sm" c="dimmed">
          ✅ Miles de usuarios nos visitan cada día para encontrar nuevos grupos y canales. Únete a la comunidad de JoinGroups y empieza a descubrir, conectar y compartir hoy mismo.
        </Text>

      </Box>

      <Button
        variant="outline"
        color="blue"
        component="a"
        href="https://wa.me/5212284935831?text=Hola,%20tengo%20un%20problema%20para%20publicar%20mi%20grupo%20en%20JoinGroups"
        target="_blank"
        rel="noopener noreferrer"
        fullWidth
      >
        {t('¿Tienes problemas? O quisieras sugerir un cambio en la página? Escríbenos por WhatsApp')}
      </Button>


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

    </Container>
  );
}
