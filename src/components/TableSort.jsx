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
  MultiSelect,
} from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useMediaQuery } from '@mantine/hooks';
import slugify from '../assets/slugify';
import styles from './TableSort.module.css';
import { useLocation } from 'react-router-dom';
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
        onClick={() => navigate(`/comunidades/grupos-de-${row.tipo}/${slug}`)}
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
        {/* ——— TITLE ——— */}
        <title>Grupos de Telegram y WhatsApp Activos 2025: Encuentra, Únete o Publica tu Grupo Gratis</title>

        {/* ——— DESCRIPTION ——— */}
        <meta
          name="description"
          content="Grupos de Telegram y WhatsApp activos en 2025. Conecta con comunidades de tus intereses, encuentra canales, miembros y personas con tus mismos gustos. Publica tu grupo gratis para llegar a más usuarios."
        />

        {/* ——— KEYWORDS ——— */}
        <meta
          name="keywords"
          content="Grupos de Telegram, Canales de Telegram, Enlaces Telegram, Unirse a Grupos Telegram, Publicar Grupo Telegram, Comunidades Telegram, Grupos de WhatsApp, Canales de WhatsApp, Enlaces WhatsApp, Unirse a Grupos WhatsApp, Publicar Grupo WhatsApp, Comunidades WhatsApp, Grupos Activos, Grupos Gratis, Encontrar Grupos, Buscar Miembros, Conocer Personas, Amistad, Usuarios"
        />

        {/* ——— CANONICAL ——— */}
        <link rel="canonical" href="https://joingroups.pro/#/comunidades" />

        {/* ——— OPEN GRAPH ——— */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://joingroups.pro/#/comunidades" />
        <meta property="og:title" content="Grupos de Telegram y WhatsApp Activos 2025: Encuentra, Únete o Publica tu Grupo Gratis" />
        <meta property="og:description" content="Explora y únete a miles de grupos de Telegram y WhatsApp activos. Conecta con comunidades de tus intereses, encuentra canales y miembros. Publica tu grupo gratis." />
        <meta property="og:image" content="https://joingroups.pro/JoinGroups.ico" />
        <meta property="og:site_name" content="JoinGroups" />

        {/* ——— TWITTER CARDS ——— */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://joingroups.pro/#/comunidades" />
        <meta name="twitter:title" content="Grupos de Telegram y WhatsApp Activos 2025: Encuentra, Únete o Publica tu Grupo Gratis" />
        <meta name="twitter:description" content="Explora y únete a miles de grupos de Telegram y WhatsApp activos. Conecta con comunidades de tus intereses, encuentra canales y miembros. Publica tu grupo gratis." />
        <meta name="twitter:image" content="https://joingroups.pro/JoinGroups.ico" />

        {/* ——— SCHEMA.ORG ——— */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Grupos de Telegram y WhatsApp Activos 2025",
            "description": "Grupos de Telegram y WhatsApp ACTIVOS en 2025. Encuantra canales de Telegram y WhatsApp en 2025. Encuentra comunidades de tus intereses, busca miembros, conoce personas y publica tu grupo gratis para llegar a más usuarios.",
            "url": "https://joingroups.pro/#/comunidades",
            "mainEntity": {
              "@type": "ItemList",
              "name": "Categorías de Grupos y Canales",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "Thing",
                    "name": "Grupos de Telegram",
                    "url": "https://joingroups.pro/#/comunidades/grupos-de-telegram",
                    "description": "Encuentra Grupos de Telegram de diversas temáticas. Conecta con miembros y usuarios."
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "Thing",
                    "name": "Grupos de WhatsApp",
                    "url": "https://joingroups.pro/#/comunidades/grupos-de-whatsapp",
                    "description": "Descubre y Unete a Grupos de WhatsApp ACTIVOS por Tematica. Busca y conoce personas con tus mismos gustos."
                  }
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
              <Title order={2} mb="sm" className={styles.GruposDeTelegram}>
                Grupos de Telegram ⟶ Enlaces Directos para Unirte (Por Temática)
              </Title>

              <div className={styles.GruposDeTelegram}>
              <h2>Grupos de Telegram: Descubre y Únete a Comunidades Activas</h2>
              <p>
                Los <strong>Grupos de Telegram</strong> se han convertido en una de las formas más populares de conectarse con personas que comparten tus intereses. Desde tecnología hasta entretenimiento, existen miles de comunidades esperando nuevos miembros. Si estás buscando una forma de expandir tus redes o simplemente pasar un buen rato, unirte a grupos de Telegram puede ser la opción ideal.
              </p>

              <h3>Unirse a Grupos de Telegram Nunca Fue Tan Fácil</h3>
              <p>
                Hoy en día, <strong>unirse a grupos de Telegram</strong> es un proceso rápido y sencillo. A través de plataformas como JoinGroups, puedes explorar una gran variedad de comunidades activas, organizadas por categorías, intereses y temáticas. Ya no necesitas buscar por horas; aquí encuentras lo que te gusta en segundos.
              </p>

              <h3>Enlaces de Grupos de Telegram Verificados y Activos</h3>
              <p>
                Uno de los mayores desafíos es encontrar <strong>enlaces de grupos de Telegram</strong> que realmente funcionen y estén activos. En nuestro sitio recopilamos los mejores enlaces verificados, para que no pierdas tiempo con enlaces rotos o grupos abandonados. Todo está organizado para que accedas directamente a las comunidades más relevantes.
              </p>

              <h3>Buscar Grupos de Telegram por Temática e Intereses</h3>
              <p>
                Si quieres <strong>buscar grupos de Telegram</strong> específicos, puedes usar nuestro sistema de filtros por categoría. ¿Te gusta el anime? ¿Estás interesado en criptomonedas? ¿Quieres unirte a grupos de estudio? Aquí puedes encontrar exactamente lo que buscas de forma fácil y sin complicaciones.
              </p>

              <h3>Grupos Públicos de Telegram para Todos</h3>
              <p>
                Los <strong>grupos públicos de Telegram</strong> permiten que cualquier persona pueda unirse sin necesidad de una invitación privada. Esta apertura es ideal para quienes buscan ampliar sus horizontes, hacer networking, o simplemente conocer gente nueva. Nuestra plataforma te ayuda a descubrir estos grupos y unirte con un solo clic.
              </p>

              <h2>Grupos de Telegram para Adultos 18+: Encuentra Comunidades NSFW Activas</h2>
              <p>
                Existen <strong>grupos de Telegram para adultos </strong> que se enfocan en conversaciones, contenido NSFW, o relaciones. JoinGroups permite encontrar este tipo de comunidades con etiquetas claras y advertencias necesarias para usuarios mayores de edad. El acceso es directo, seguro y sin spam.
              </p>

              <h3>Los Mejores Grupos de Telegram en un Solo Lugar</h3>
              <p>
                ¿Quieres estar en los más populares? Hemos recopilado una selección con los <strong>Mejores Grupos de Telegram</strong>, basada en actividad, número de usuarios y relevancia. No te conformes con cualquier grupo; accede directamente a los más destacados del momento.
              </p>

              <p>
                En JoinGroups, nuestro objetivo es ayudarte a encontrar, compartir y unirte a las mejores comunidades de Telegram. Desde los <strong>grupos públicos</strong> más populares hasta aquellos más especializados, aquí tienes todo lo que necesitas para empezar.
              </p>

              <h2>Cómo Hacer Crecer un Grupo de Telegram en 2025: Guía para Admins</h2>
              <p>
                Si te preguntas <strong>cómo hacer crecer mi grupo de Telegram</strong>, estás en el lugar indicado. Hacer crecer una comunidad de Telegram requiere estrategia, paciencia y las herramientas adecuadas. A continuación, te ofrecemos los mejores consejos para aumentar la participación, atraer nuevos miembros y asegurar que tu grupo se mantenga activo y atractivo.
              </p>

              <h3>Promocionar mi Grupo de Telegram en Canales Relacionados</h3>
              <p>
                Una estrategia eficaz para <strong>hacer crecer tu grupo</strong> es promoverlo en otros <strong>canales de Telegram</strong> relacionados. Puedes colaborar con administradores de otros grupos similares para intercambiar menciones o invitaciones. Esto ayuda a atraer miembros interesados en el mismo tipo de contenido.
              </p>

              <h3>¿Cómo encontrar los mejores grupos de Telegram?</h3>
              <p>Para encontrar los mejores grupos de Telegram, usa plataformas que verifiquen los enlaces, como JoinGroups. Filtra por categoría o interés y evita enlaces rotos.</p>

            </div>

              <Text size="sm" color="dimmed" mb="xs">
                {t('Tienes un grupo o canal de Telegram o Whatsapp ??')} <strong>{t('En JoinGroups puedes publicar tu grupo gratis')}</strong> {t('y conseguir más miembros fácilmente.')}
                {t('Explora una lista actualizada de')} <strong>{t('grupos y canales de Telegram y Whatsapp')}</strong> {t('organizados por temática e intereses.')}{' '}
                {t('Únete a comunidades activas, descubre nuevos grupos y haz crecer tu comunidad en Telegram con JoinGroups.')}
              </Text>

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
              {t('Quieres que tu grupo de Telegram o Whatsapp crezca y llegue a más personas ??')}
            </Text>

            <Text size="sm" color="dimmed" mb="xs">
              {t('Publica tu grupo gratuitamente en')} <Link to="/" style={{ color: '#228be6', textDecoration: 'underline' }}>JoinGroups</Link> {t('y conecta con una comunidad activa que comparte tus intereses.')}
              {t('Si aún no sabes cómo crear un grupo, puedes aprender fácilmente')} {' '}
              <Link to={i18n.language === 'es' ? '/comunidades/como-crear-grupo-telegram' : '/comunidades/how-to-create-telegram-group'}
                style={{ color: '#228be6', textDecoration: 'underline' }}>
                {t('aquí cómo crear tu grupo de Telegram')}
              </Link>.
            </Text>


            <Text size="xs" color="dimmed" style={{ fontStyle: 'italic' }}>
              {t('Únete a miles de usuarios que ya están haciendo crecer sus comunidades en Telegram.')}
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
