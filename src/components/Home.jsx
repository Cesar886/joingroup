// Home.jsx
import {
  ActionIcon,
  Title,
  Text,
  Button,
  Container,
  Image,
  Stack,
  Group,
  Box,
  Menu,
  Center,
  Divider,
  Paper,
  rem,
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

const countryMap = {
  mx: '🇲🇽',
  us: '🇺🇸',
  ar: '🇦🇷',
  co: '🇨🇴',
  es: '🇪🇸',
  pe: '🇵🇪',
  cl: '🇨🇱',
  ve: '🇻🇪',
  br: '🇧🇷',
  ec: '🇪🇨',
  gt: '🇬🇹',
  bo: '🇧🇴',
  do: '🇩🇴',
  hn: '🇭🇳',
  py: '🇵🇾',
  sv: '🇸🇻',
  ni: '🇳🇮',
  cr: '🇨🇷',
  pa: '🇵🇦',
  uy: '🇺🇾',
  pr: '🇵🇷',
  ca: '🇨🇦',
  de: '🇩🇪',
  fr: '🇫🇷',
  it: '🇮🇹',
  gb: '🇬🇧',
  nl: '🇳🇱',
  pt: '🇵🇹',
  jp: '🇯🇵',
  kr: '🇰🇷',
  cn: '🇨🇳',
  in: '🇮🇳',
  ru: '🇷🇺',
  au: '🇦🇺',
};


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
  const baseLang = typeof i18n.language === 'string' ? i18n.language.split('-')[0] : 'es';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const subdomain = window.location.hostname.includes('.') ? window.location.hostname.split('.')[0] : 'mx';
  const currentLang = subdomain === 'us' ? 'en' : 'es';

  useEffect(() => {
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [i18n, currentLang]);

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
        onClick={() => {
          const categoria = row.categories?.[0] || 'otros';
          const basePath = isGroup
            ? `/comunidades/grupos-de-${row.tipo}/${slugify(categoria)}`
            : `/clanes/clanes-de-${row.tipo}`;
          navigate(`${basePath}/${slug}`);
        }}
        style={{ cursor: 'pointer' }}
      >
        <Table withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <Group align="center" w="100%">
                  <Group gap={10} align="center">
                    {row.city && (
                      <Text >
                        {countryMap[row.city]}
                      </Text>
                    )}
                    <Text fw={700}>{row.name}</Text>
                  </Group>

                  <Box ml="auto">
                    <img
                      src={iconSrc}
                      alt={row.name}
                      width={24}
                      height={24}
                      style={{ borderRadius: 4 }}
                    />
                  </Box>
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
    <Container
      size="md"
      py="xl"
      className={styles.mobileContainerFix}
    >

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
                En <strong>JoinGroups.pro</strong> puedes unirte fácilmente a comunidades populares en <strong>Telegram</strong>, <strong>WhatsApp</strong> y juegos como <strong>Clash Royale</strong>. Explora grupos organizados por temas, idiomas y más.
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


    <Box className={styles['scrolling-container']} mt="xl" >
      <div className={styles['scrolling-track']}>
        {[...featuredButtons, ...featuredButtons].map((b, i) => (
          <Button
            key={i}
            component={Link}
            to={b.to}
            leftSection={b.icon}
            variant="light"
            radius="xl"
            color={b.color}
            style={{
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
              flexShrink: 0,
            }}
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
              style={{
                fontSize: rem(24),
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{
                fontSize: '16px',
                display: 'inline-block',
                lineHeight: '1',
                borderRadius: '2px',
                overflow: 'hidden',
                width: '20px',
                height: '14px',
              }}>
                {countries.find((c) => c.value === subdomain)?.emoji ?? '🇲🇽'}
              </span>
              <span style={{ fontSize: '0.75rem', transform: 'translateY(1px)' }}>▼</span>
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
                leftSection={
                  <span style={{
                    fontSize: '16px',
                    display: 'inline-block',
                    lineHeight: '1',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    width: '20px',
                    height: '14px',
                  }}>
                    {country.emoji}
                  </span>
                }
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
        color="rgba(255, 0, 0, 1)"
        size="sm"
        variant='filled'
        radius="xl"
        className={styles['floating-publish-button']}
        style={{
          ...floatingStyle(buttonPosition),
        }}
      >
        Publica tu grupo GRATIS !!
      </Button>

      <Button
        variant="outline"
        color="blue"
        mt='xl'
        component="a"
        href="https://wa.me/5212284935831?text=Hola,%20quisiera%20sugerir%20un%20cambio%20para%20la%20pagina%20de%20JoinGroups"
        target="_blank"
        rel="noopener noreferrer"
        fullWidth
      >
        {t('¿Tienes problemas? O quisieras sugerir un cambio en la página? Escríbenos por WhatsApp')}
      </Button>
    </Container>
  );
}
