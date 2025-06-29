import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useMediaQuery } from '@mantine/hooks';
import slugify from '../assets/slugify';

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

export default function TableSort() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentPage, setCurrentPage] = useState(1);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const handleCollectionFilter = (collection) => {
    const newValue = collection === selectedCollection ? null : collection;
    setSelectedCollection(newValue);
    setSortedData(sortData(data, {
      sortBy,
      reversed: reverseSortDirection,
      search,
      collectionFilter: newValue
    }));
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const fetchCollections = async () => {
        const snapshot = await getDocs(collection(db, 'colections'));
        const docs = snapshot.docs.map(doc => doc.data());
        const allCollections = docs.flatMap(doc => Array.isArray(doc.colections) ? doc.colections : []);
        console.log("Docs crudos:", docs);
        console.log("Colecciones planas:", allCollections);

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

  const setSorting = (field) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(data, { sortBy: field, reversed, search }));
  };

  const handleSearchChange = (event) => {
    const value = event.currentTarget.value;
    setSearch(value);
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value, collectionFilter: selectedCollection }));
  };

  const groupsPerPage = 12;
  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = sortedData.slice(indexOfFirstGroup, indexOfLastGroup);

  const rows = currentGroups.map((row, idx) => {
    const slug = row.slug || slugify(row.name);

    return (
      <Paper
        withBorder
        radius="md"
        shadow="xs"
        mb="sm"
        key={`${row.id}-${slug}-${idx}`}
        onClick={() => navigate(`/grupo/${slug}`)}
      >
        <Table horizontalSpacing="md" withRowBorders={false}>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Text fw={700}>{row.name}</Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td width="23%">
                <Text>
                  {row.content18 === 'Sí'
                    ? '18+'
                    : isMobile
                      ? 'Público'
                      : 'Apto para todo público'}
                </Text>
                <Text size="xs" c="dimmed">Contenido</Text>
              </Table.Td>
              <Table.Td width="43%">
                <Text>{row.categories}</Text>
                <Text size="xs" c="dimmed">Categoría</Text>
              </Table.Td>
              <Table.Td width="34%">
                <Text>{row.visitas}</Text>
                <Text size="xs" c="dimmed">Vistas</Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <Box p="sm" style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
          <Text
            size="sm"
            c="dimmed"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {row.description}
          </Text>
        </Box>
      </Paper>
    );
  });

  return (
    <ScrollArea>
      {selectedCollection && (
        <Button
          size="xs"
          variant="outline"
          color="gray"
          mb="xs"
          onClick={() => handleCollectionFilter(selectedCollection)}
        >
          Quitar filtro: {selectedCollection}
        </Button>
      )}

      <TextInput
        placeholder="Buscar por nombre, categoría o contenido..."
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
            Todos
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

      {rows.length > 0 ? (
        <>
          <Paper
            withBorder
            radius="md"
            shadow="xs"
            mt="xl"
            p="md"
            style={{ backgroundColor: '#f9f9f9', marginBottom: '20px', paddingBottom: '10px' }}
          >
          <Text size="sm" color="dimmed" mb="xs">
            ¿Tienes un grupo o canal de Telegram? <strong>En JoinGroups puedes publicarlo gratis</strong> para que más personas lo descubran fácilmente. 
            Además, puedes <strong>explorar canales y grupos de Telegram</strong> por temática e intereses, y <strong>unirte a comunidades activas</strong> de todo tipo. 
            ¡Comparte tu grupo, encuentra otros y haz crecer tu comunidad en Telegram con JoinGroups!
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
              Inicio
            </Button>
            <Button
              variant="subtle"
              size="xs"
              radius="md"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Anterior
            </Button>
            <Text size="sm" fw={500} mt={4}>
              Página <strong>{currentPage}</strong>
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
              Siguiente →
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
              <strong>Descubre y promociona grupos de Telegram</strong> en un solo lugar.
            </Text>
            <Text size="sm" color="dimmed" mb="xs">
              ¿Tienes un grupo o canal? <strong>Publica tu grupo de Telegram</strong> gratis y haz que más personas lo encuentren.
              También puedes <strong>explorar grupos interesantes de Telegram</strong> , <strong>unirte a comunidades</strong> y ver <strong>grupos de telegram</strong> según tus intereses.
              ¡Conecta, comparte y crece con nosotros!
            </Text>
            <Text size="xs" color="dimmed" style={{ fontStyle: 'italic' }}>
              <strong>Palabras clave:</strong> publicar grupo en Telegram, encontrar grupos de Telegram, compartir canal de Telegram, descubrir comunidades Telegram, promocionar grupo Telegram.
            </Text>
          </Paper>
        </>
      ) : (
        <Text ta="center" fw={500} c="dimmed" mt="xl">
          No se encontraron resultados.
        </Text>
      )}
    </ScrollArea>
  );
}
