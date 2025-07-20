import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from '@tabler/icons-react';
import {
  Box,
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
  Title,
} from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useMediaQuery } from '@mantine/hooks';
import slugify from '../assets/slugify';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const getCategoryUrl = (category, currentPath) => {
  // Detectar si estamos en la página de Telegram o WhatsApp
  if (currentPath.includes('/grupos-de-telegram')) {
    return `/comunidades/grupos-de-telegram/${slugify(category)}`;
  } else if (currentPath.includes('/grupos-de-whatsapp')) {
    return `/comunidades/grupos-de-whatsapp/${slugify(category)}`;
  } else {
    // Si estamos en la página general de comunidades, redirigir a Telegram por defecto
    return `/comunidades/grupos-de-telegram/${slugify(category)}`;
  }
};

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

import { useTranslation } from 'react-i18next';



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

function sortData(data, { sortBy, reversed, search, collectionFilter }) {
  const filtered = filterData(data, search, collectionFilter);
  if (!sortBy) return filtered;
  
  return [...filtered].sort((a, b) =>
    reversed
  ? b[sortBy]?.localeCompare(a[sortBy])
  : a[sortBy]?.localeCompare(b[sortBy])
);
}

export default function Whatsapp() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  // const [sortBy, setSortBy] = useState(null);
  // const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedCollections, setSelectedCollections] = useState([]);  // ✅ único estado
  const [collections, setCollections] = useState([]);  
  const [currentPage, setCurrentPage] = useState(1);
  // const [collections, setCollections] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orden = searchParams.get('orden');

  useEffect(() => {
    setSortedData(
      sortData(data, { search, collectionFilter: selectedCollections })
    );
    setCurrentPage(1);               // regresa a página 1 si cambian filtros
  }, [data, search, selectedCollections]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // const orden = searchParams.get('orden');
    const cats = searchParams.get('cats')?.split(',') || [];

    setSelectedCollections(cats);
  }, [location.search]);


  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filtrar solo grupos de tipo "telegram"
      const telegramGroups = groups.filter(g => g.tipo === 'whatsapp');

      const fetchCollections = async () => {
        // const snapshot = await getDocs(collection(db, 'colections'));
        // const docs = snapshot.docs.map(doc => doc.data());
        // const allCollections = docs.flatMap(doc => Array.isArray(doc.colections) ? doc.colections : []);
        // setCollections([...new Set(allCollections)]);
      };

      fetchCollections();

      // const destacados = telegramGroups.filter(g => g.destacado);
      // const normales = telegramGroups.filter(g => !g.destacado);
      let ordenados = [...telegramGroups];

      if (orden === 'top' || orden === 'vistos') {
        ordenados.sort((a, b) => b.visitas - a.visitas);
      } else if (orden === 'nuevos') {
        ordenados.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() ?? new Date(0);
          const dateB = b.createdAt?.toDate?.() ?? new Date(0);
          return dateB - dateA;
        });
      }

      setData(ordenados);
      setSortedData(ordenados);
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

  // const setSorting = (field) => {
  //   const reversed = field === sortBy ? !reverseSortDirection : false;
  //   setReverseSortDirection(reversed);
  //   setSortBy(field);
  //   setSortedData(sortData(data, { sortBy: field, reversed, search }));
  // };

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
        
    const isTelegram = location.pathname === '/telegram';
    const iconSrc = isTelegram ? '/telegramicons.png' : '/wapp.webp';

    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        mb="sm"
        key={`${row.id}-${slug}-${idx}`}
        onClick={() => {
          const mainCategory = row.categories?.[0] || 'otros';
          const categoryUrl = getCategoryUrl(mainCategory, location.pathname);
          navigate(`${categoryUrl}/${slug}`);
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
          >{row.name}</Text>          <img
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
                      ? 'Público'
                      : 'Apto para todo público'}
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
        {/* ——— TITLE (≤60 car.) ——— */}
        <title>Grupos de WhatsApp ACTIVOS 2025 | Publica y Haz Crecer tu Grupo o Canal de Whatsapp</title>

        {/* ——— DESCRIPTION (≈150 car.) ——— */}
        <meta
          name="description"
          content="Únete a los grupos de WhatsApp más activos de 2025: tecnología, estudio, ventas y más. Publica tu enlace gratis y conecta con miles de personas afines."
        />

        {/* ——— KEYWORDS (poco peso en Google, pero útil en otros buscadores) ——— */}
        <meta
          name="keywords"
          content="grupos de whatsapp activos 2025, enlaces whatsapp, unirse a grupos whatsapp, publicar grupo whatsapp, comunidades whatsapp, canales whatsapp"
        />

        {/* ——— CANONICAL (evita duplicados) ——— */}
        <link rel="canonical" href="https://joingroups.pro/comunidades/grupos-de-whatsapp" />

        {/* ——— OPEN GRAPH (FB / WhatsApp) ——— */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://joingroups.pro/comunidades/grupos-de-whatsapp" />
        <meta property="og:title"       content="Grupos de WhatsApp Activos 2025 | Únete o Publica el Tuyo" />
        <meta property="og:description" content="Únete a los grupos de WhatsApp más activos de 2025: tecnología, estudio, ventas y más. Publica tu enlace gratis y conecta con miles de personas afines." />
        <meta property="og:image"       content="https://joingroups.pro/JoinGroups.ico" />
        <meta property="og:site_name"   content="JoinGroups" />

        {/* ——— TWITTER CARDS ——— */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:url"         content="https://joingroups.pro/comunidades/grupos-de-whatsapp" />
        <meta name="twitter:title"       content="Grupos de WhatsApp Activos 2025 | Únete o Publica el Tuyo" />
        <meta name="twitter:description" content="Únete a los grupos de WhatsApp más activos de 2025: tecnología, estudio, ventas y más. Publica tu enlace gratis y conecta con miles de personas afines." />
        <meta name="twitter:image"       content="https://joingroups.pro/JoinGroups.ico" />

        {/* ——— SCHEMA.ORG (JSON-LD) ——— */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Grupos de WhatsApp Activos 2025",
            "description": "Únete a los grupos de WhatsApp más activos de 2025: tecnología, estudio, ventas y más.",
            "url": "https://joingroups.pro/comunidades/grupos-de-whatsapp",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Categorías de Grupos de WhatsApp",
              "itemListElement": [
                { "@type": "SiteNavigationElement", "position": 1, "name": "Tecnología", "url": "https://joingroups.pro/comunidades/grupos-de-whatsapp/tecnologia" },
                { "@type": "SiteNavigationElement", "position": 2, "name": "Estudio",     "url": "https://joingroups.pro/comunidades/grupos-de-whatsapp/estudio" },
                { "@type": "SiteNavigationElement", "position": 3, "name": "+18",        "url": "https://joingroups.pro/comunidades/grupos-de-whatsapp/18" },
                { "@type": "SiteNavigationElement", "position": 4, "name": "Ventas",     "url": "https://joingroups.pro/comunidades/grupos-de-whatsapp/ventas" }
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
                img src="/wapp.webp"
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
                <Button onClick={() => navigate('?orden=top')} variant={orden === 'top' ? 'filled' : 'light'}>Top</Button>
                <Button onClick={() => navigate('?orden=nuevos')} variant={orden === 'nuevos' ? 'filled' : 'light'}>Nuevos</Button>
                <Button onClick={() => navigate('')} variant={!orden ? 'filled' : 'light'}>Destacados</Button>
              </Group>
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
                      onClick={() => {
                        // Navegar a la página específica de la categoría
                        const categoryUrl = getCategoryUrl(cat, location.pathname);
                        navigate(categoryUrl);
                      }}
                      style={{
                        padding: '10px 16px',
                        fontSize: '14px',
                        fontWeight: 600,
                        backgroundColor: selected ? '#5e2ca5' : '#f3e8ff',
                        color: selected ? '#ffffff' : '#4a0080',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease', // Añadir transición suave
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
                  {t('¡Grupos de Whatsapp!')}
                </Title>
                <Text size="sm" color="dimmed" mb="xs">
                  {t('¿Tienes un grupo de WhatsApp?')} <strong>{t('Publícalo gratis')}</strong> {t('y consigue miembros al instante.')}
                </Text>
              </>
            ) : (
              <>
                <Title order={3} mb="xs">
                  📣 {t('¡Promociona tu Grupo de WhatsApp en JoinGroups!')}
                </Title>
                <Text size="sm" color="dimmed" mb="xs">
                  📱 {t('¿Tienes un grupo de WhatsApp y quieres hacerlo crecer?')} <strong>{t('En JoinGroups puedes publicar tu grupo gratis')}</strong> {t('y empezar a recibir nuevos miembros interesados.')}<br />
                  🔍 {t('Explora una lista actualizada de')} <strong>{t('grupos de WhatsApp')}</strong> {t('organizados por categoría e intereses.')}{' '}
                  🤝 {t('Únete a comunidades activas, comparte tu grupo y conéctate con personas afines usando JoinGroups.')}
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

            <Paper
              withBorder
              radius="md"
              shadow="xs"
              mt="xl"
              p="md"
              style={{ backgroundColor: '#f9f9f9', marginBottom: '20px', paddingBottom: '10px' }}
            >
            <Text size="md" fw={600} mb="sm">
              {t('¿Quieres que tu grupo de Whatsapp crezca y llegue a más personas?')}
            </Text>

            <Text size="sm" color="dimmed" mb="xs">
              {t('Publica tu grupo gratuitamente en')} <Link to="/" style={{ color: '#228be6', textDecoration: 'underline' }}>JoinGroups</Link> {t('y conecta con una comunidad activa que comparte tus intereses.')}
              {t('Si aún no sabes cómo crear un grupo, puedes aprender fácilmente')} {' '}
              <Link to="/instrucciones-crear-grupo-telegram" style={{ color: '#228be6', textDecoration: 'underline' }}>
                {t('aquí cómo crear tu grupo de Telegram')}
              </Link>.
            </Text>

            <Text size="xs" color="dimmed" style={{ fontStyle: 'italic' }}>
              {t('Únete a miles de usuarios que ya están haciendo crecer sus comunidades en Telegram.')}
            </Text>
            </Paper>
          </>
          <Text ta="center" fw={500} c="dimmed" mt="xl">
            {t('No se encontraron resultados.')}
          </Text>
      </ScrollArea>
    </>
  );
}
