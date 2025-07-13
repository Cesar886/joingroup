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
import styles from './TableSortWhastapp.module.css';
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

export default function Whatsapp() {
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
        
    const isTelegram = location.pathname === '/telegram';
    const iconSrc = isTelegram ? '/telegramicons.png' : '/wapp.webp';

    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        mb="sm"
        key={`${row.id}-${slug}-${idx}`}
        onClick={() => navigate(`/comunidades/grupos-de-whatsapp/${slug}`)}
      >
        <Table horizontalSpacing="md" withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={3}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text fw={700}>{row.name}</Text>
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
        <link rel="canonical" href="https://joingroups.pro/#/comunidades/grupos-de-whatsapp" />

        {/* ——— OPEN GRAPH (FB / WhatsApp) ——— */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://joingroups.pro/#/comunidades/grupos-de-whatsapp" />
        <meta property="og:title"       content="Grupos de WhatsApp Activos 2025 | Únete o Publica el Tuyo" />
        <meta property="og:description" content="Únete a los grupos de WhatsApp más activos de 2025: tecnología, estudio, ventas y más. Publica tu enlace gratis y conecta con miles de personas afines." />
        <meta property="og:image"       content="https://joingroups.pro/JoinGroups.ico" />
        <meta property="og:site_name"   content="JoinGroups" />

        {/* ——— TWITTER CARDS ——— */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:url"         content="https://joingroups.pro/#/comunidades/grupos-de-whatsapp" />
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
            "url": "https://joingroups.pro/#/comunidades/grupos-de-whatsapp",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Categorías de Grupos de WhatsApp",
              "itemListElement": [
                { "@type": "SiteNavigationElement", "position": 1, "name": "Tecnología", "url": "https://joingroups.pro/#/comunidades/grupos-de-whatsapp/tecnologia" },
                { "@type": "SiteNavigationElement", "position": 2, "name": "Estudio",     "url": "https://joingroups.pro/#/comunidades/grupos-de-whatsapp/estudio" },
                { "@type": "SiteNavigationElement", "position": 3, "name": "+18",        "url": "https://joingroups.pro/#/comunidades/grupos-de-whatsapp/18" },
                { "@type": "SiteNavigationElement", "position": 4, "name": "Ventas",     "url": "https://joingroups.pro/#/comunidades/grupos-de-whatsapp/ventas" }
              ]
            }
          }
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
              Grupos de WhatsApp ⟶ Enlaces Directos para Unirte (Por Temática)
            </Title>

            <div className={styles.GruposDeTelegram}>
              <h2>Grupos de WhatsApp: Únete a Comunidades Activas y Conecta con Nuevos Miembros</h2>
              <p>
                Los <strong>grupos de WhatsApp</strong> se han convertido en una de las mejores formas de <strong>conocer personas</strong>, compartir intereses y disfrutar <strong>contenido</strong> en tiempo real. Desde entretenimiento y estudio hasta <strong>amistad</strong> o negocios, existen miles de comunidades activas esperando nuevos <strong>usuarios</strong> como tú.
              </p>

              <h3>Unirte a un Grupo de WhatsApp Nunca Fue Tan Rápido</h3>
              <p>
                Hoy en día, <strong>unirse a grupos de WhatsApp</strong> es simple y directo. En <strong>JoinGroups</strong> puedes explorar <strong>grupos verificados</strong> organizados por temáticas, intereses, idioma y cantidad de <strong>miembros</strong>. Ya no necesitas buscar en foros ni en redes sociales; aquí <strong>puedes encontrar</strong> tu comunidad ideal en segundos.
              </p>

              <h3>Grupos de WhatsApp con Enlaces Activos y Contenido Relevante</h3>
              <p>
                Uno de los mayores desafíos es hallar <strong>grupos con enlaces que funcionen</strong>. En JoinGroups reunimos los <strong>mejores grupos de WhatsApp</strong> con acceso directo, sin spam y con <strong>contenido actualizado</strong>. Todos nuestros enlaces son revisados para que accedas a canales activos y reales.
              </p>

              <h3>Buscar Grupos de WhatsApp por Temática y Categoría</h3>
              <p>
                Ya sea que busques <strong>grupos de estudio</strong>, deportes, memes, música, negocios o videojuegos, nuestro sistema de búsqueda y filtros te permite encontrar grupos según tus intereses. Puedes filtrar por tipo de <strong>canal</strong>, país o idioma fácilmente, incluso desde tu dispositivo <strong>Android</strong>.
              </p>

              <h3>Grupos Públicos de WhatsApp para Todos los Usuarios</h3>
              <p>
                Los <strong>grupos públicos de WhatsApp</strong> no requieren invitación personal. Esta característica los hace perfectos para ampliar tus contactos, compartir ideas o hacer <strong>networking</strong>. Ya sea desde tu celular o buscando en <strong>Google</strong>, puedes unirte con un solo clic.
              </p>

              <h2>Grupos de WhatsApp para Adultos 18+: Comunidades NSFW con Acceso Seguro</h2>
              <p>
                También puedes encontrar <strong>grupos de WhatsApp para adultos</strong> enfocados en <strong>contenido NSFW</strong> o relaciones. En JoinGroups estos grupos cuentan con advertencias claras y están marcados apropiadamente para usuarios mayores de edad. El acceso es seguro y verificado.
              </p>

              <h3>Los Mejores Grupos de WhatsApp, Seleccionados para Ti</h3>
              <p>
                Nuestra selección de <strong>mejores grupos de WhatsApp</strong> incluye aquellos con más actividad, mejores temas y mayor número de <strong>usuarios</strong>. Si buscas calidad y participación, aquí encontrarás lo más relevante del momento.
              </p>

              <p>
                JoinGroups es la plataforma ideal para <strong>crear, encontrar y compartir grupos</strong>. Nuestro objetivo es ayudarte a conectar con <strong>personas reales</strong> y comunidades activas, sin perder tiempo en canales vacíos.
              </p>

              <h2>Cómo Hacer Crecer tu Grupo de WhatsApp en 2025</h2>
              <p>
                ¿Quieres <strong>hacer crecer tu grupo de WhatsApp</strong>? Te ofrecemos consejos prácticos para <strong>crear</strong> una comunidad activa, atraer nuevos <strong>miembros</strong> y aumentar la participación. Desde la gestión del <strong>contenido</strong> hasta la promoción efectiva, aquí tienes lo que necesitas.
              </p>

              <h3>Promocionar tu Grupo en Canales Similares</h3>
              <p>
                Una técnica clave para ganar <strong>usuarios</strong> es promocionarte en otros <strong>canales y grupos relacionados</strong>. En JoinGroups puedes destacar tu comunidad y llegar a más personas interesadas en tu temática.
              </p>

              <h3>¿Cómo Encontrar los Mejores Grupos de WhatsApp?</h3>
              <p>
                La mejor manera es usar plataformas confiables como JoinGroups. Te mostramos solo <strong>grupos verificados</strong>, organizados por categoría, <strong>número de miembros</strong> e idioma, para que <strong>puedas unirte</strong> sin complicaciones ni riesgos.
              </p>
            </div>

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
        ) : (
          <Text ta="center" fw={500} c="dimmed" mt="xl">
            {t('No se encontraron resultados.')}
          </Text>
        )}
      </ScrollArea>
    </>
  );
}
