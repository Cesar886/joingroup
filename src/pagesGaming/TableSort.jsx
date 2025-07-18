import { useState, useEffect, useRef} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
  IconSwords,
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
// import { useLocation } from 'react-router-dom';
import styles from './TableSortClanes.module.css';
import { Helmet } from 'react-helmet-async';



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

export default function Clanes() {
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
  const [selectedCollection, setSelectedCollection] = useState(null);
  // const location = useLocation();

  const [buttonPosition, setButtonPosition] = useState('top-left');
  const positionRef = useRef('top-left');


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

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'clanes'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));


      const fetchCollections = async () => {
        const snapshot = await getDocs(collection(db, 'colections'));
        const docs = snapshot.docs.map(doc => doc.data());
        const allCollections = docs.flatMap(doc => Array.isArray(doc.colections) ? doc.colections : []);
        setCollections([...new Set(allCollections)]);
      };

      fetchCollections();

      const destacados = groups.filter(g => g.destacado);
      const normales = groups.filter(g => !g.destacado);
      const ordenados = [...destacados, ...normales];

      setData(ordenados);
      setSortedData(ordenados);
    };

    fetchData();
  }, []);


  // const setSorting = (field) => {
  //   const reversed = field === sortBy ? !reverseSortDirection : false;
  //   setReverseSortDirection(reversed);
  //   setSortBy(field);
  //   setSortedData(sortData(data, { sortBy: field, reversed, search }));
  // };

  const handleSearchChange = (event) => {
    const value = event.currentTarget.Telegramvalue;
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
        
    const iconSrc =
      row.tipo === 'clash-royale'
        ? '/clashRoyaleFondo1.png'     
        : '/clashOfClansFondo.png'; 

    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        mb="sm"
        key={`${row.id}-${slug}-${idx}`}
        onClick={() => navigate(`/clanes/clanes-de-${row.tipo}/${slug}`)}
      >
        <Table horizontalSpacing="md" withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text fw={700}>{row.name}</Text>
          <img
            src={iconSrc}
            alt={row.tipo}
            style={{
              width: isMobile ? 24 : 32,
              height: isMobile ? 24 : 32,
              borderRadius: '50%',
              marginLeft: '10px',
            }}
            // size={isMobile ? 24 : 32}
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
        <title>Clanes de Videojuegos Activos 2025: Únete o Publica tu Clan Gratis</title>

        {/* ——— DESCRIPTION ——— */}
        <meta
          name="description"
          content="Encuentra y únete a los mejores clanes de videojuegos activos en 2025. Publica tu clan gratis para reclutar miembros y conectar con comunidades de jugadores de Clash Royale y Clash of Clans."
        />

        {/* ——— KEYWORDS (no tan importantes en Google, pero útiles para buscadores menores) ——— */}
        <meta
          name="keywords"
          content="Clanes de Videojuegos, clanes activos, mejores clanes, unirse a clan, publicar clan, comunidades de jugadores, clanes gratis, Clash Royale, Clash of Clans, grupos de juegos, reclutar jugadores, clanes 2025"
        />

        {/* ——— CANONICAL ——— */}
        <link rel="canonical" href="https://joingroups.pro/clanes" />

        {/* ——— OPEN GRAPH ——— */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://joingroups.pro/clanes" />
        <meta property="og:title" content="Clanes de Videojuegos Activos 2025: Únete o Publica tu Clan Gratis" />
        <meta property="og:description" content="Encuentra y únete a los mejores clanes de videojuegos activos. Publica tu clan gratis para reclutar miembros y conectar con la comunidad gamer de Clash Royale y Clash of Clans." />
        <meta property="og:image" content="https://joingroups.pro/JoinGroups.ico" />
        <meta property="og:site_name" content="JoinGroups" />

        {/* ——— TWITTER CARDS ——— */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://joingroups.pro/clanes" />
        <meta name="twitter:title" content="Clanes de Videojuegos Activos 2025: Únete o Publica tu Clan Gratis" />
        <meta name="twitter:description" content="Encuentra y únete a los mejores clanes de videojuegos activos. Publica tu clan gratis para reclutar miembros y conectar con la comunidad gamer de Clash Royale y Clash of Clans." />
        <meta name="twitter:image" content="https://joingroups.pro/JoinGroups.ico" />

        {/* ——— SCHEMA.ORG ——— */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Clanes de Videojuegos Activos 2025",
            "description": "Explora y únete a los clanes de videojuegos más activos en 2025. Publica tu clan gratis para reclutar jugadores y conectar con comunidades de Clash Royale y Clash of Clans.",
            "url": "https://joingroups.pro/clanes",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Clanes de Clash Royale y Clash of Clans",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "Thing",
                    "name": "Clanes de Clash Royale",
                    "url": "https://joingroups.pro/clanes/clanes-de-clash-royale",
                    "description": "Encuentra clanes activos de Clash Royale para unirte o publicar el tuyo."
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "Thing",
                    "name": "Clanes de Clash of Clans",
                    "url": "https://joingroups.pro/clanes/clanes-de-clash-of-clans",
                    "description": "Descubre los mejores clanes de Clash of Clans para guerras y comunidad."
                  }
                }
              ]
            }
          }
          `}
        </script>
      </Helmet>


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

        {collections.length > 0 && (
          <Group mb="md" spacing="xs" wrap="wrap">
            <Badge
              key="todos"
              variant={selectedCollection === null ? 'filled' : 'light'}
              color={selectedCollection === null ? 'blue' : 'gray'}
              size="md"
              onClick={() => handleCollectionFilter(null)}
              style={{ cursor: 'pointer' }}
            >
              {t('Todos')}
            </Badge>

            {collections.map((col) => (
              <Badge
                key={col}
                variant={selectedCollection === col ? 'filled' : 'light'}
                color={selectedCollection === col ? 'blue' : 'gray'}
                size="md"
                onClick={() => handleCollectionFilter(col)}
                style={{ cursor: 'pointer' }}
              >
                {col}
              </Badge>
            ))}
          </Group>
        )}
      <ScrollArea>

        {rows.length > 0 ? (
          <>
            <Group gap='xs' mb="md" justify="center">
              <Button
                height={140}
                variant="light"
                size="xs"
                radius="md"
                onClick={() => navigate('/clanes/clanes-de-clash-royale')}
                leftSection={
                  <img
                    src="/clashRoyaleFondo1.png"
                    alt="Clash Royale"
                    style={{ width: 32, height: 32 }}
                  />
                }
              >
                {t('Clash Royale')}
              </Button>

              <Button
                variant="light"
                size="xs"
                radius="md"
                onClick={() => navigate('/clanes/clanes-de-clash-of-clans')}
                leftSection={
                  <img
                    src="/clashOfClansFondo.png"
                    alt="Clash of Clans"
                    style={{ width: 34, height: 34 }}
                  />
                }
              >
                {t('Clash of Clans')}
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
              <Title order={2} mb="sm" className={styles.GruposDeTelegram}>
                Grupos de Juegos en Telegram y WhatsApp ⟶ Únete Directamente (Por Categoría)
              </Title>

              <div className={styles.GruposDeTelegram}>
                <h2>Grupos de Juegos: Encuentra Comunidades Activas para Jugar y Conocer Nuevos Miembros</h2>
                <p>
                  Los <strong>grupos de juegos en Telegram y WhatsApp</strong> son ideales para <strong>conocer personas</strong> con tus mismos intereses, compartir estrategias, organizar partidas o simplemente charlar sobre tu juego favorito. Desde títulos móviles hasta consolas y PC, existen miles de <strong>canales y grupos activos</strong> esperando nuevos <strong>usuarios</strong>.
                </p>

                <h3>Únete a Grupos de Juegos en Telegram, WhatsApp y Discord</h3>
                <p>
                  En <strong>JoinGroups</strong> puedes <strong>unirte a grupos</strong> rápidamente gracias a nuestros <strong>enlaces verificados</strong>. Accede a comunidades clasificadas por juego, plataforma, país o idioma. Ya sea que juegues Free Fire, Clash Royale, Among Us, Roblox o Call of Duty Mobile, aquí encontrarás el grupo ideal.
                </p>

                <h3>Grupos de Juegos con Enlaces Activos y Moderación Real</h3>
                <p>
                  Sabemos que es frustrante hacer clic en enlaces rotos o <strong>grupos abandonados</strong>. Por eso en JoinGroups solo mostramos <strong>grupos activos</strong>, revisados manualmente y organizados para que <strong>puedas encontrar contenido</strong> real y actualizado.
                </p>

                <h3>Buscar Grupos Gamer por Plataforma, Juego o Comunidad</h3>
                <p>
                  Usa nuestro sistema de búsqueda para filtrar <strong>grupos de juegos</strong> por plataforma: Android, iOS, PC, consolas, y también por temáticas como PvP, clanes, torneos, eSports o solo charlas. Todo está organizado para ayudarte a <strong>encontrar grupos</strong> fácilmente, sin complicaciones.
                </p>

                <h3>Grupos Públicos de Juegos para Todos los Jugadores</h3>
                <p>
                  Nuestra plataforma te da acceso a <strong>grupos públicos de Telegram y WhatsApp</strong> donde puedes unirte sin invitaciones. Es la <strong>forma más fácil</strong> de expandir tu red de amigos gamers, conocer nuevas personas o simplemente pasar un buen rato con jugadores reales.
                </p>

                <h2>Grupos de Juegos para Adultos: Comunidades 18+ en Telegram</h2>
                <p>
                  También existen <strong>grupos NSFW de juegos</strong> o comunidades para adultos que combinan el mundo gamer con conversaciones privadas. En JoinGroups puedes encontrar este tipo de grupos con etiquetas claras y advertencias apropiadas, garantizando privacidad y contenido verificado.
                </p>

                <h3>Top Grupos de Juegos en Telegram: ¡No te Pierdas los Más Populares!</h3>
                <p>
                  Consulta nuestra selección de los <strong>mejores grupos de juegos</strong>, actualizados por número de <strong>miembros</strong>, participación y calidad del contenido. Desde clanes competitivos hasta comunidades relajadas, te mostramos lo más destacado del momento.
                </p>

                <p>
                  JoinGroups es la herramienta ideal para <strong>crear, encontrar y compartir</strong> comunidades gamer. Aquí puedes descubrir nuevos <strong>canales</strong>, unirte a grupos organizados y estar siempre al tanto de lo mejor del mundo de los juegos.
                </p>

                <h2>Cómo Hacer Crecer tu Grupo de Juegos en Telegram</h2>
                <p>
                  Si eres administrador, te mostramos <strong>cómo hacer crecer tu grupo de juegos</strong> en Telegram o WhatsApp. Aprende a mejorar tu contenido, atraer nuevos <strong>usuarios</strong>, y mantener una comunidad activa e interesante para todos los miembros.
                </p>

                <h3>Promociona tu Grupo de Juegos en Comunidades Relacionadas</h3>
                <p>
                  Una forma efectiva de ganar <strong>miembros</strong> es promocionarlo en otros <strong>grupos y canales</strong> similares. Usa nuestra plataforma para que otros jugadores descubran tu grupo fácilmente y se unan directamente desde sus dispositivos, incluso si vienen desde <strong>Google</strong>.
                </p>

                <h3>¿Cómo encontrar los mejores grupos de juegos?</h3>
                <p>
                  Usa herramientas como JoinGroups para acceder a <strong>grupos verificados</strong>, organizados por categorías y sin spam. Encuentra comunidades reales, con contenido útil, y empieza a jugar con otros desde hoy.
                </p>
              </div>


            {isMobile ? (
              <>
                <Title order={4} mb="xs">
                  📣 {t('¡Promociona tu Clan de VideoJuego en JoinGroups!')}
                </Title>
                <Text size="sm" color="dimmed" mb="xs">
                  📱 {t('¿Tienes un clan de videojuego?')} <strong>{t('Publícalo gratis')}</strong> {t('y consigue miembros al instante.')}
                </Text>
              </>
            ) : (
              <>
                <Title order={3} mb="xs">
                  📣 {t('¡Promociona tu Clan de VideoJuego en JoinGroups!')}
                </Title>
                <Text size="sm" color="dimmed" mb="xs">
                  📱 {t('¿Tienes un clan de videojuego y quieres hacerlo crecer?')} <strong>{t('En JoinGroups puedes publicar tu clan gratis')}</strong> {t('y empezar a recibir nuevos miembros interesados.')}<br />
                  🔍 {t('Explora una lista actualizada de')} <strong>{t('clanes de videojuegos')}</strong> {t('organizados por categoría e intereses.')}{' '}
                  🤝 {t('Únete a comunidades activas, comparte tu clan y conéctate con personas afines usando JoinGroups.')}
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
              {t('¿Quieres que tu Clan de videojuego crezca y llegue a más personas?')}
            </Text>

            <Text size="sm" color="dimmed" mb="xs">
              {t('Publica tu Clan gratuitamente en')} <Link to="/" style={{ color: '#228be6', textDecoration: 'underline' }}>JoinGroups</Link> {t('y conecta con una comunidad activa que comparte tus intereses. ')}
              {t('Si aún no sabes cómo crear un clan, puedes aprender fácilmente')} {' '}
              <Link to="/instrucciones-crear-grupo-telegram" style={{ color: '#228be6', textDecoration: 'underline' }}>
                {t('aquí cómo crear tu clan de Telegram')}
              </Link>.
            </Text>

            <Text size="xs" color="dimmed" style={{ fontStyle: 'italic' }}>
              {t('Únete a miles de usuarios que ya están haciendo crecer sus clanes en JoinGroups.')}
            </Text>
            </Paper>
          </>
        ) : (
          <Text ta="center" fw={500} c="dimmed" mt="xl">
            {t('No se encontraron resultados.')}
          </Text>
        )}
        {/* Botón flotante con cambio de posición */}
        <Button
          component={Link}
          to="/clanes/form"
          color="red"
          size="sm"
          variant='filled'
          radius="xl"
          className={styles['floating-publish-button']}
          style={{
            ...floatingStyle(buttonPosition),
          }}
        >
          Publica tu clan AHORA !!
        </Button>
      </ScrollArea>
    </>
  );
}
