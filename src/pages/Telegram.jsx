import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
import styles from './TableSortTelegram.module.css';
import { Helmet } from 'react-helmet-async';

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

function filterData(data, search, collectionFilter = null) {
  const query = search.toLowerCase().trim();
  return data.filter((item) => {
    const matchesSearch = ['name', 'categories', 'content18'].some((key) =>
      item[key]?.toLowerCase().includes(query)
  );
  
  const matchesCollection = collectionFilter
  ? item.categories?.toLowerCase() === collectionFilter.toLowerCase()
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

export default function Telegram() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  // const [sortBy, setSortBy] = useState(null);
  // const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentPage, setCurrentPage] = useState(1);
  // const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orden = searchParams.get('orden');
  

  const handleCollectionFilter = (collection) => {
    const newValue = collection === selectedCollection ? null : collection;
    setSelectedCollection(newValue);
    setSortedData(sortData(data, {
      // sortBy,
      // reversed: reverseSortDirection,
      search,
      collectionFilter: newValue
    }));
    setCurrentPage(1);
  };

  useEffect(() => {


    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const telegramGroups = groups.filter(g => g.tipo === 'telegram');

      const fetchCollections = async () => {
        // const snapshot = await getDocs(collection(db, 'colections'));
        // const docs = snapshot.docs.map(doc => doc.data());
        // const allCollections = docs.flatMap(doc => Array.isArray(doc.colections) ? doc.colections : []);
        // setCollections([...new Set(allCollections)]);
      };
      fetchCollections();

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



  // const setSorting = (field) => {
  //   const reversed = field === sortBy ? !reverseSortDirection : false;
  //   setReverseSortDirection(reversed);
  //   setSortBy(field);
  //   setSortedData(sortData(data, { sortBy: field, reversed, search }));
  // };

  const handleSearchChange = (event) => {
  const value = event.currentTarget.value;
    setSearch(value);
    setSortedData(sortData(data, { search: value, collectionFilter: selectedCollection }));
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
        
    const iconSrc = '/telegramicons.png'

    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        mb="sm"
        key={`${row.id}-${slug}-${idx}`}
        onClick={() => navigate(`/comunidades/grupos-de-telegram/${slug}`)}
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
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              objectFit: 'cover',
              marginLeft: 'auto',
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

  return (
    <>
      <Helmet>
        {/* ——— TITLE ——— */}
        <title>Grupos de Telegram Activos 2025 | Las Mejores Comunidades ACTIVAS</title>

        {/* ——— DESCRIPTION ——— */}
        <meta
          name="description"
          content="Únete a los mejores Grupos de Telegram en 2025. Canales, grupos +18, anime, estudio, tecnología y más. Publica tu grupo gratis y conéctate con comunidades activas."
        />

        {/* ——— KEYWORDS (no tan importantes en Google, pero útiles para buscadores menores) ——— */}
        <meta
          name="keywords"
          content="grupos de telegram, enlaces telegram, canales de telegram, comunidades telegram, telegram +18, grupos telegram activos, publicar grupo telegram"
        />

        {/* ——— CANONICAL ——— */}
        <link rel="canonical" href="https://joingroups.pro/comunidades/grupos-de-telegram" />

        {/* ——— OPEN GRAPH ——— */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://joingroups.pro/comunidades/grupos-de-telegram" />
        <meta property="og:title"       content="Grupos de Telegram Activos 2025 | Únete o Publica el Tuyo" />
        <meta property="og:description" content="Únete a comunidades activas de Telegram. Grupos +18, anime, estudio, tecnología y más. Publica el tuyo gratis." />
        <meta property="og:image"       content="https://joingroups.pro/JoinGroups.ico" />
        <meta property="og:site_name"   content="JoinGroups" />

        {/* ——— TWITTER CARDS ——— */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:url"         content="https://joingroups.pro/comunidades/grupos-de-telegram" />
        <meta name="twitter:title"       content="Grupos de Telegram Activos 2025 | Únete o Publica el Tuyo" />
        <meta name="twitter:description" content="Únete a comunidades activas de Telegram. Grupos +18, anime, estudio, tecnología y más. Publica el tuyo gratis." />
        <meta name="twitter:image"       content="https://joingroups.pro/JoinGroups.ico" />

        {/* ——— SCHEMA.ORG ——— */}

        <script type="application/ld+json">
          {`
          [
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Grupos de Telegram Activos 2025",
              "description": ""Descubre y únete a los grupos de Telegram más activos en 2025: canales de +18, anime, estudio, tecnología, amistad y mucho más. Actualizado constantemente."",
              "url": "https://joingroups.pro/comunidades/grupos-de-telegram",
              "mainEntity": {
                "@type": "ItemList",
                "name": "Categorías de Grupos de Telegram",
                "itemListElement": [
                  { "@type": "SiteNavigationElement", "position": 1, "name": "+18",        "url": "https://joingroups.pro/comunidades/grupos-de-telegram/18" },
                  { "@type": "SiteNavigationElement", "position": 2, "name": "Anime",      "url": "https://joingroups.pro/comunidades/grupos-de-telegram/anime" },
                  { "@type": "SiteNavigationElement", "position": 3, "name": "Estudio",    "url": "https://joingroups.pro/comunidades/grupos-de-telegram/estudio" },
                  { "@type": "SiteNavigationElement", "position": 4, "name": "Tecnología", "url": "https://joingroups.pro/comunidades/grupos-de-telegram/tecnologia" }
                ]
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Grupos de Telegram Activos 2025",
              "url": "https://joingroups.pro/comunidades/grupos-de-telegram"
            }
          ]
          `}
        </script>

      </Helmet>

      <ScrollArea>
        {selectedCollection && (
          <Button
            variant="outline"
            color="gray"
            mb="xs"
            onClick={() => handleCollectionFilter(selectedCollection)}
          >
            {t('Quitar filtro')}: {selectedCollection}
          </Button>
        )}

        <TextInput
          placeholder={t('Buscar por nombre, categoría o contenido...')}
          mb="md"
          leftSection={<IconSearch size={16} stroke={1.5} />}
          value={search}
          onChange={handleSearchChange}
        />

        {rows.length > 0 ? (
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

            <Paper
              withBorder
              radius="md"
              shadow="xs"
              mt="xl"
              p="md"
              style={{ backgroundColor: '#f9f9f9', marginBottom: '20px', paddingBottom: '10px' }}
            >
            <Title order={2} mb="sm" className={styles.GruposDeTelegram}>
              Grupos de Telegram con Enlaces Directos (Por Temática y Número de Miembros)
            </Title>

            <div className={styles.GruposDeTelegram}>
              <h2>Grupos de Telegram: Conoce Personas y Únete a Comunidades Activas</h2>
              <p>
                Un <strong>grupo en Telegram</strong> es una excelente <strong>forma de conocer personas</strong> con intereses similares. Desde tecnología, videojuegos y criptomonedas hasta <strong>amistad</strong> y estudio, existen miles de <strong>grupos y canales</strong> activos esperando nuevos <strong>miembros</strong>. Si estás buscando expandir tu red o simplemente disfrutar contenido entretenido, unirte a <strong>grupos de Telegram</strong> es una excelente opción.
              </p>

              <h3>Cómo Unirse a Grupos de Telegram en Segundos</h3>
              <p>
                <strong>Unirse a un grupo de Telegram</strong> nunca ha sido tan fácil. Con plataformas como JoinGroups <strong>puedes encontrar grupos</strong> organizados por temáticas, idioma, país y cantidad de usuarios. Todo el proceso está optimizado para que accedas rápidamente desde cualquier dispositivo, ya sea <strong>Android</strong> o navegador.
              </p>

              <h3>Enlaces de Grupos de Telegram Verificados y con Contenido Real</h3>
              <p>
                Muchos usuarios se frustran al buscar <strong>grupos en Telegram</strong> por culpa de enlaces rotos. En JoinGroups nos aseguramos de que cada enlace esté activo y el <strong>contenido</strong> sea relevante. Nuestros moderadores revisan manualmente los <strong>canales y grupos</strong> para garantizar una experiencia segura y útil.
              </p>

              <h3>Buscar Grupos de Telegram por Categoría y Número de Miembros</h3>
              <p>
                ¿Te interesa un grupo de anime, música, marketing o desarrollo web? Nuestro sistema de filtros te permite <strong>buscar grupos</strong> según tus intereses y por número de <strong>miembros</strong>. Así, <strong>puedes encontrar</strong> lo que buscas sin perder tiempo.
              </p>

              <h3>Grupos Públicos de Telegram para Todos los Usuarios</h3>
              <p>
                Los <strong>grupos públicos de Telegram</strong> son accesibles para cualquier <strong>usuario</strong>, sin necesidad de invitación. Esto permite <strong>conectar con personas</strong> nuevas, compartir experiencias o simplemente hacer networking en tu área de interés. Desde tu móvil o en <strong>Google</strong>, accede a ellos con un clic.
              </p>

              <h2>Grupos de Telegram 18+: Comunidades NSFW con Acceso Seguro</h2>
              <p>
                Si buscas <strong>grupos de Telegram para adultos</strong>, JoinGroups también ofrece acceso a comunidades NSFW. Todos los enlaces están verificados y acompañados de advertencias claras. Solo para mayores de edad, con acceso directo, sin spam y sin riesgo.
              </p>

              <h3>Explora los Mejores Grupos de Telegram en 2025</h3>
              <p>
                En JoinGroups hemos recopilado los <strong>mejores grupos</strong> del año según actividad, número de <strong>usuarios</strong> y calidad del <strong>contenido</strong>. No pierdas tiempo buscando en foros: accede directamente a los <strong>grupos más populares</strong> y actualizados del momento.
              </p>

              <p>
                Ya sea para chatear, aprender, compartir archivos o simplemente pasar un buen rato, en JoinGroups <strong>puedes encontrar el grupo ideal</strong>. Crea conexiones reales, intercambia ideas y únete a comunidades activas.
              </p>

              <h2>¿Cómo Hacer Crecer tu Grupo de Telegram en 2025?</h2>
              <p>
                ¿Te preguntas <strong>cómo hacer crecer tu grupo de Telegram</strong>? Te ayudamos a <strong>crear y gestionar</strong> una comunidad sólida. Desde estrategias de contenido hasta consejos para aumentar la participación, aquí tienes lo que necesitas para triunfar como admin.
              </p>

              <h3>Promocionar tu Grupo en Canales Relevantes</h3>
              <p>
                Una buena estrategia para <strong>hacer crecer tu grupo</strong> es promocionarlo en <strong>canales y grupos relacionados</strong>. Conecta con otros administradores, intercambia menciones o usa plataformas como JoinGroups para llegar a más personas interesadas.
              </p>

              <h3>¿Cómo Encontrar los Mejores Grupos de Telegram?</h3>
              <p>
                La forma más efectiva de <strong>encontrar grupos</strong> es usar sitios que verifiquen sus enlaces, como JoinGroups. Filtra por temática, idioma, número de <strong>miembros</strong> o nivel de actividad y olvídate de enlaces rotos o comunidades vacías.
              </p>
            </div>

            {isMobile ? (
              <>
                <Title order={4} mb="xs">
                  {t('Mejores Grupos de Telegram')}
                </Title>
                <Text size="sm" color="dimmed" mb="xs">
                  {t('¿Tienes un grupo de Telegram?')} <strong>{t('Publícalo gratis en JoinGroups')}</strong> {t('y consigue nuevos miembros fácilmente. Descubre cómo crecer con comunidades activas y visibles en toda la web.')}
                </Text>
              </>
            ) : (
              <>
                <Title order={3} mb="xs">
                  {t('Promociona tu Grupo de Telegram en JoinGroups')}
                </Title>
                <Text size="sm" color="dimmed" mb="xs">
                  {t('¿Tienes un grupo o canal en Telegram y quieres hacerlo crecer?')} <strong>{t('En JoinGroups puedes publicarlo gratis')}</strong> {t('y empezar a recibir nuevos miembros interesados.')}{' '}
                  {t('Explora los mejores grupos de Telegram organizados por temática, intereses y comunidad.')}{' '}
                  {t('Utiliza nuestro buscador y encuentra canales, consejos y recursos para hacer destacar tu grupo en el mundo Telegram.')}
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
              {t('¿Quieres que tu grupo de Telegram crezca y llegue a más personas?')}
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
        ) : (
          <Text ta="center" fw={500} c="dimmed" mt="xl">
            {t('No se encontraron resultados.')}
          </Text>
        )}
      </ScrollArea>
    </>
  );
}
