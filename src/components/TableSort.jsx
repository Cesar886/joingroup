import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from '@tabler/icons-react';
import {
  Box,
  ActionIcon,
  Center,
  Group,
  Paper,
  ScrollArea,
  Badge,
  Table,
  Text,
  TextInput,
  Button,
  UnstyledButton,
  Menu,
  Title,
  MultiSelect,
  rem,
} from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useMediaQuery } from '@mantine/hooks';
import slugify from '../assets/slugify';
import styles from './TableSort.module.css';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';


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


function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
        <Group justify="space-between">
          <Text fw={600} size="xl" lh={1.2}>{children}</Text>
          <Center>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}


export default function TableSort() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  // const [sortBy, setSortBy] = useState(null);
  // const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentPage, setCurrentPage] = useState(1);
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);  // ✅ único estado
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orden = searchParams.get('orden');
  const subdomain = window.location.hostname.includes('.') ? window.location.hostname.split('.')[0] : 'mx';

  
  const [buttonPosition, setButtonPosition] = useState('top-left');
  const positionRef = useRef('top-left');

  const toggleCollection = (collection) => {
    setSelectedCollections((prev) =>
      prev.includes(collection) ? [] : [collection]
    );
  };


  useEffect(() => {
    setSortedData(
      sortData(data, { search, collectionFilter: selectedCollections })
    );
    setCurrentPage(1);               // regresa a página 1 si cambian filtros
  }, [data, search, selectedCollections]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (selectedCollections.length) {
      params.set('cats', selectedCollections.join(','));
    } else {
      params.delete('cats');
    }
    navigate({ search: params.toString() }, { replace: true });
    // eslint‑disable‑next‑line react‑hooks/exhaustive‑deps
  }, [selectedCollections]);   // ✅ sin ‘location’ y sin duplicar el hook



  function filterData(data, search, collectionFilter = []) {
    const query = search.toLowerCase().trim();

    return data.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(query) ||
        item.content18?.toLowerCase().includes(query) ||
        item.categories?.some(cat => cat.toLowerCase().includes(query));


      const matchesCollection = collectionFilter.length
        ? item.categories?.some((cat) =>
            collectionFilter.some((filtro) =>
              cat.toLowerCase().includes(filtro.toLowerCase())
            )
          )
        : true;

      return matchesSearch && matchesCollection;
    });
  }


  function sortData(data, { search, collectionFilter }) {
    // (solo filtrado; si luego quieres ordenar, agrega la lógica aquí)
    return filterData(data, search, collectionFilter);
  }


  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(groups);
    };
    fetchData();
  }, [location.search]);

  const fetchCollections = async () => {
    const snapshot = await getDocs(collection(db, 'colections'));
    const docs = snapshot.docs.map(doc => doc.data());
    const allCollections = docs.flatMap(doc => Array.isArray(doc.colections) ? doc.colections : []);
    setCollections([...new Set(allCollections)]);
    // setCollections({ collections: [...new Set(allCollections)] });
  };
  fetchCollections();


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // const orden = searchParams.get('orden');
    const cats = searchParams.get('cats')?.split(',') || [];

    setSelectedCollections(cats);
  }, [location.search]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orden = searchParams.get('orden');

    let ordenados = [...data];

    if (orden === 'top' || orden === 'vistos') {
      ordenados.sort((a, b) => b.visitas - a.visitas);
    } else if (orden === 'nuevos') {
      ordenados.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() ?? new Date(0);
        const dateB = b.createdAt?.toDate?.() ?? new Date(0);
        return dateB - dateA;
      });
    }

    const final = sortData(ordenados, {
      search,
      collectionFilter: selectedCollections,
    });

    setSortedData(final);
  }, [data, search, selectedCollections, location.search]);



  
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

  const handleSearchChange = (event) => {
    setSearch(event.currentTarget.value);
  };

  const groupsPerPage = 12;
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = sortedData.slice(indexOfFirstGroup, indexOfLastGroup);

  // 1️⃣  Calcula el idioma base una sola vez:
  const baseLang = i18n.language.split('-')[0]; // "en-US" → "en"
  

  // …

  const rows = currentGroups.map((row, idx) => {
    const slug = row.slug || slugify(row.name);

    // 2️⃣  Elige la descripción correcta para este row:
    const descriptionText =
      typeof row.description === 'object'
        ? row.description[baseLang]           // intento 1: "en"
          || row.description[i18n.language]   // intento 2: "en-US"
          || row.description['es']            // intento 3: español por defecto
        : row.description;
        
    const isTelegram = row.tipo?.trim().toLowerCase() === 'telegram';
    const iconSrc = isTelegram ? '/telegramicons.png' : '/wapp.webp';


    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        mb="sm"
        key={`${row.id}-${slug}-${idx}`}
        onClick={() => {
          const categoria = row.categories?.[0] || 'otros';
          navigate(`/comunidades/grupos-de-${row.tipo}/${slugify(categoria)}/${slug}`);
        }}
      >
        <Table horizontalSpacing="md" withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {row.city && (
            <Text size="sm" >
              {countryMap[row.city] || row.city}
            </Text>
          )}
          <Text 
            fw={700}
            style={{
              marginLeft: '8px',
            }}
          >{row.name}</Text>
          <img
            src={iconSrc}
            alt={row.name}
            style={{
              width: isTelegram ? '24px' : '39px',
              height: isTelegram ? '24px' : '39px',
              borderRadius: '4px',
              objectFit: 'cover',
              marginLeft: 'auto',
              marginRight: isTelegram ? '9px' : '0px',
              marginTop: isTelegram ? '5px' : '0px',
            }}
          />
        </div>
      </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td width="33%">
                <Text>{t(row.categories)}</Text>
                <Text size="xs" c="dimmed">{t('Categoría')}</Text>
              </Table.Td>
              <Table.Td width="33%">
                <Text>
                  {row.content18 === 'Sí'
                    ? '18+'
                    : isMobile
                      ? t('Público')
                      : t('Apto para todo público')}
                </Text>
                <Text size="xs" c="dimmed">{t('Contenido')}</Text>
              </Table.Td>
              <Table.Td width="33%">
                <Text>{row.visitas}</Text>
                <Text size="xs" c="dimmed">{t('Vistas')}</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      <Box p="sm" style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
        <Text
          lineClamp={1}
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {descriptionText}
        </Text>
      </Box>
      </Paper>
    );
  });

  const collectionsExist = Array.isArray(collections) && collections.length > 0;

  return (
    <>
      <Helmet>
        {/*
          --- TÍTULO (Title) ---
          Optimización:
          - Más orientado a la acción ("Encuentra y Únete").
          - Incluye "WhatsApp" para ampliar el alcance, ya que esta página es un agregador.
          - Mantiene el año para relevancia y el branding "JoinGroups".
        */}
        <title>Encuentra y Únete a Grupos de Telegram y WhatsApp | Comunidades 2025</title>

        {/*
          --- DESCRIPCIÓN (Description) ---
          Optimización:
          - Comienza con un llamado a la acción claro.
          - Menciona explícitamente ambas plataformas (Telegram y WhatsApp).
          - Usa un lenguaje más natural y atractivo para el usuario.
        */}
        <meta
          name="description"
          content="Descubre el directorio más completo de comunidades online. Encuentra enlaces de invitación para grupos de Telegram y WhatsApp por categorías: amistad, gaming, anime, +18 y más."
        />

        {/*
          --- KEYWORDS ---
          Eliminada. Esta etiqueta es obsoleta y no tiene valor para el SEO moderno.
          Las palabras clave importantes ya están integradas en el título y la descripción.
        */}

        {/* ——— CANONICAL ——— (Sin cambios, es correcta) */}
        <link rel="canonical" href="https://joingroups.pro/comunidades" />

        {/*
          --- OPEN GRAPH (para redes sociales como Facebook, WhatsApp ) ---
          Optimización:
          - Título y descripción alineados con las metaetiquetas principales para consistencia.
          - Se enfoca en el beneficio directo para el usuario ("El directorio #1...").
        */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://joingroups.pro/comunidades" />
        <meta property="og:title" content="El Directorio #1 de Grupos de Telegram y WhatsApp" />
        <meta property="og:description" content="¿Buscas una comunidad? Explora cientos de grupos activos por categorías y únete con un solo clic. ¡Encuentra tu lugar ideal!" />
        <meta property="og:image" content="https://joingroups.pro/images/og-comunidades-joingroups.jpg" />
        <meta property="og:site_name" content="JoinGroups" />

        {/*
          --- TWITTER CARDS (para Twitter/X ) ---
          Optimización:
          - Mensajes adaptados para ser concisos y directos, como es común en Twitter.
        */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://joingroups.pro/comunidades" />
        <meta name="twitter:title" content="Tu Puerta de Entrada a Miles de Comunidades Online" />
        <meta name="twitter:description" content="Encuentra enlaces directos a grupos de Telegram y WhatsApp. Explora, filtra por categoría y únete a la conversación." />
        <meta name="twitter:image" content="https://joingroups.pro/images/twitter-comunidades-joingroups.jpg" />

        {/*
          --- SCHEMA.ORG (JSON-LD para datos estructurados ) ---
          Optimización:
          - Se mantiene `CollectionPage` pero se añade un `BreadcrumbList` (migas de pan).
            Esto le indica a Google la jerarquía del sitio (Inicio > Comunidades), lo cual es excelente para el SEO.
          - El `mainEntity` ahora usa `SiteNavigationElement`, que es más específico y semánticamente correcto
            para una lista de enlaces a otras páginas de categorías.
        */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Directorio de Comunidades de Telegram y WhatsApp",
              "description": "Navega por nuestro directorio de comunidades online. Filtra por plataforma y categoría para encontrar grupos de tu interés.",
              "url": "https://joingroups.pro/comunidades",
              "mainEntity": {
                "@type": "ItemList",
                "name": "Plataformas Principales",
                "itemListElement": [
                  {
                    "@type": "SiteNavigationElement",
                    "position": 1,
                    "name": "Grupos de Telegram",
                    "description": "Explora todas las comunidades disponibles en Telegram.",
                    "url": "https://joingroups.pro/comunidades/grupos-de-telegram"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 2,
                    "name": "Grupos de WhatsApp",
                    "description": "Encuentra grupos de WhatsApp por temas de interés.",
                    "url": "https://joingroups.pro/comunidades/grupos-de-whatsapp"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 3,
                    "name": "Clanes de Videojuegos",
                    "description": "Descubre clanes para juegos como Clash Royale y Clash of Clans.",
                    "url": "https://joingroups.pro/clanes"
                  }
                ]
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Inicio",
                    "item": "https://joingroups.pro/"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Comunidades",
                    "item": "https://joingroups.pro/comunidades"
                  }
                ]
              }
            }
          `}
        </script>
      </Helmet>

      <ScrollArea>
        <TextInput
          placeholder={t('Buscar por nombre, categoría o contenido...')}
          mb="md"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={search}
          onChange={handleSearchChange}
        />

          <>
            <Group gap='xs' mb="md" justify="center">
              <Button
                variant="light"
                size="xs"
                radius="md"
                onClick={() => navigate('/comunidades/grupos-de-telegram')}
                leftSection={
                  <img
                    src="/telegramicons.png"
                    alt="Telegram"
                    style={{ width: 16, height: 16 }}
                  />
                }
              >
                {t('Telegram')}
              </Button>

              <Button
                variant="light"
                size="xs"
                radius="md"
                onClick={() => navigate('/comunidades/grupos-de-whatsapp')}
                leftSection={
                  <img
                    src="/wapp.webp"
                    alt="Whatsapp"
                    style={{ width: 29, height: 29 }}
                  />
                }
              >
                {t('Whatsapp')}
              </Button>
              <Group mt="md" mb="md">
                <Button
                  onClick={() => {
                    const params = new URLSearchParams(location.search);
                    const currentOrden = params.get('orden');
                    if (currentOrden === 'top') {
                      params.delete('orden'); // quitar si ya estaba activo
                    } else {
                      params.set('orden', 'top');
                    }
                    navigate({ search: params.toString() }, { replace: false });
                  }}
                  variant={orden === 'top' ? 'filled' : 'light'}
                >
                  Top
                </Button>

                <Button
                  onClick={() => {
                    const params = new URLSearchParams(location.search);
                    const currentOrden = params.get('orden');
                    if (currentOrden === 'nuevos') {
                      params.delete('orden');
                    } else {
                      params.set('orden', 'nuevos');
                    }
                    navigate({ search: params.toString() }, { replace: false });
                  }}
                  variant={orden === 'nuevos' ? 'filled' : 'light'}
                >
                  Nuevos
                </Button>

                <Button
                  onClick={() => {
                    const params = new URLSearchParams(location.search);
                    params.delete('orden'); // quitar orden para mostrar "destacados"
                    navigate({ search: params.toString() }, { replace: false });
                  }}
                  variant={!orden ? 'filled' : 'light'}
                >
                  Destacados
                </Button>
              </Group>


              <Box
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '10px',
                  padding: '10px 0',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {collectionsExist &&
                  collections.map((cat, i) => {
                    const selected = selectedCollections.includes(cat);
                    return (
                      <Badge
                        key={i}
                        variant={selected ? 'filled' : 'light'}
                        color="violet"
                        size="lg"
                        radius="xl"
                        onClick={() => toggleCollection(cat)}
                        style={{
                          padding: '10px 16px',
                          fontSize: '14px',
                          fontWeight: 600,
                          backgroundColor: selected ? '#5e2ca5' : '#f3e8ff',
                          color: selected ? '#ffffff' : '#4a0080',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                          cursor: 'pointer',
                        }}
                      >
                        {cat}
                      </Badge>
                    );
                  })}
              </Box>
            </Group>

            <Paper
              withBorder
              radius="md"
              shadow="xs"
              mt="xl"
              p="md"
              style={{ backgroundColor: '#f9f9f9', marginBottom: '20px', paddingBottom: '10px' }}
            >
            {isMobile ? (
              <>
              <Title order={4} mb="xs">
                {t('Grupos de Telegram Activos 2025')}
              </Title>
              <Text size="sm" color="dimmed" mb="xs">
                {t('Únete a los')} <strong>{t('mejores grupos de Telegram')}</strong> {t('o publica el tuyo gratis y consigue nuevos miembros al instante.')}
              </Text>
              </>
            ) : (
              <>
                <Title order={3} mb="sm">
                  {t('Grupos de Telegram Activos 2025')}
                </Title>

                <Text size="sm" color="dimmed" mb="xs">
                  {t('¿Tienes un grupo o canal de Telegram o WhatsApp y no sabes cómo conseguir más miembros?')} <strong>{t('En JoinGroups puedes publicar tu grupo gratis')}</strong>, {t('la mejor web para encontrar comunidades activas.')}{' '}
                  {t('Explora nuestro buscador y descubre los ')}<strong>{t('Mejores Grupos de Telegram ')}</strong>{t('WhatsApp organizados por temática, intereses y nombre.')}{' '}
                  {t('Aqui encontraras las mejores ')}<strong>{t('Comunidades de Telegram ')}</strong>{t('recibe consejos útiles para aumentar tu comunidad y aprende cómo hacer crecer tu grupo con nuestras guías.')}{' '}
                  <strong>{t('JoinGroups encuentras Grpos de Telegram Activos.')}</strong>
                </Text>
              </>
            )}

            </Paper>

            {rows}

            <Group mt="xl" justify="center" gap="xs">
              <Button
                variant="light"
                size="xs"
                radius="md"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                {t('Inicio (paginación)')}
              </Button>
              <Button
                variant="subtle"
                size="xs"
                radius="md"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← {t('Anterior')}
              </Button>
              <Text size="sm" fw={500} mt={4}>
                {t('Página')} <strong>{currentPage}</strong>
              </Text>
              <Button
                variant="subtle"
                size="xs"
                radius="md"
                onClick={() =>
                  setCurrentPage((prev) =>
                    indexOfLastGroup < sortedData.length ? prev + 1 : prev
                  )
                }
                disabled={indexOfLastGroup >= sortedData.length}
              >
                {t('Siguiente')} →
              </Button>
            </Group>

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

            {rows.length === 0 && (
              <Box ta="center" mt="xl">
                <Text fw={500} c="dimmed" mb="sm">
                  {t('No se encontraron resultados para esta categoría.')}
                </Text>
                <img
                  src="https://joingroups.pro/meme-Pica.png"
                  alt="Nada, No hay, No existe"
                  style={{ width: '160px', opacity: 0.5 }}
                />
              </Box>
            )}
            
            <Paper
              withBorder
              radius="md"
              shadow="xs"
              mt="xl"
              p="md"
              style={{ backgroundColor: '#f9f9f9', marginBottom: '20px', paddingBottom: '10px' }}
            >
            <Text size="md" fw={600} mb="sm">
              {t('Como Hacer Crecer tu Grupo de Telegram, Guia definitiva')}
            </Text>

            <Text size="sm" color="dimmed" mb="xs">
              {t('Publica tu Grupo o Canal de Telegram gratis en')} <Link to="/" style={{ color: '#228be6', textDecoration: 'underline' }}>JoinGroups</Link>, {t('la mejor web para conectar con comunidades activas y encontrar nuevos miembros.')}{' '}
              {t('Explora los mejores grupos por nombre, temática o red social como Facebook o YouTube, y descubre consejos útiles para crecer.')}{' '}
              {t('¿Aún no sabes cómo crear un grupo? Aprende paso a paso desde nuestro buscador de comunidades.')}{' '}
              <Link to={i18n.language === 'es' ? '/comunidades/como-crear-grupo-telegram' : '/comunidades/how-to-create-telegram-group'}
                style={{ color: '#228be6', textDecoration: 'underline' }}>
                {t('Haz clic aquí y aprende cómo crear tu grupo de Telegram')}
              </Link>.
            </Text>



            <Text size="xs" color="dimmed" style={{ fontStyle: 'italic' }}>
              {t('Grupos de Telegram Activos 2025, Grupos de Telegram, Grupos de WhatsApp, Comunidades de Telegram, Publicar Grupo Telegram, Unirse a Grupos Telegram, Buscar Miembros Telegram, Conocer Personas Telegram')}
            </Text>
            </Paper>
          </>
        {/* Botón flotante con cambio de posición */}
        <Button
          component={Link}
          to="/comunidades/form"
          color="red"
          size="sm"
          variant='filled'
          radius="xl"
          className={styles['floating-publish-button']}
          style={{
            ...floatingStyle(buttonPosition),
          }}
        >
          Publica tu grupo AHORA !!
        </Button>
      </ScrollArea>
    </>

  );
}
