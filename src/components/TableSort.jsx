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
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;

  return (
    <Table.Th>
      <UnstyledButton onClick={onSort} style={{ width: '100%' }}>
        <Group justify="space-between">
          <Text fw={600} size="sm">{children}</Text>
          <Center>
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function filterData(data, search) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    ['name', 'categories', 'content18'].some((key) =>
      item[key]?.toLowerCase().includes(query)
    )
  );
}

function sortData(data, { sortBy, reversed, search }) {
  if (!sortBy) return filterData(data, search);
  return filterData(
    [...data].sort((a, b) =>
      reversed
        ? b[sortBy]?.localeCompare(a[sortBy])
        : a[sortBy]?.localeCompare(b[sortBy])
    ),
    search
  );
}

export default function TableSort() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'groups'));
      const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(groups);
      setSortedData(groups);
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
    setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
  };

  const rows = sortedData.map((row) => (
    <Paper withBorder radius="md" shadow="xs" p="md" mb="md" key={row.id} onClick={() => navigate(`/grupo/${row.id}`)}>
      <Table>
        <Table.Tbody>
          <Table.Tr>
            <Table.Td width="33%">
              <Text fw={600}>{row.name}</Text>
              <Text size="xs" c="dimmed">Nombre</Text>
            </Table.Td>
            <Table.Td width="33%">
              <Text>{row.content18 === 'Sí' ? 'Contenido +18' : 'Apto para todo público'}</Text>
              <Text size="xs" c="dimmed">Contenido</Text>
            </Table.Td>
            <Table.Td width="33%">
              <Text>{row.categories}</Text>
              <Text size="xs" c="dimmed">Categoría</Text>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
      <Box mt="xs" style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
        <Text size="sm" c="dimmed">
          <strong>Descripción:</strong> {row.description}
        </Text>
      </Box>
    </Paper>
  ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Buscar por nombre, categoría o contenido..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      {rows.length > 0 ? (
        rows
      ) : (
        <Text ta="center" fw={500} c="dimmed">
          No se encontraron resultados.
        </Text>
      )}
    </ScrollArea>
  );
}
