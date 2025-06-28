import { useState, useEffect } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconSelector,
} from '@tabler/icons-react';
import {
  Center,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate que la ruta sea correcta
import classes from './TableSort.module.css'; // o borralo si no usás estilos

function Th({ children, reversed, sorted, onSort }) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;

  return (
    <Table.Th className={classes?.th}>
      <UnstyledButton onClick={onSort} className={classes?.control}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">{children}</Text>
          <Center className={classes?.icon}>
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
    ['name', 'email', 'city', 'categories'].some((key) =>
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
    <>
      <Table.Tr key={row.id}>
        <Table.Td>{row.name}</Table.Td>
        <Table.Td>{row.email}</Table.Td>
        <Table.Td>{row.categories}</Table.Td>
      </Table.Tr>
      <Table.Tr>
        <Table.Td colSpan={3}>
          <Text size="sm" c="dimmed">
            <strong>Descripción:</strong> {row.description}<br />
            <strong>Enlace:</strong> <a href={row.link} target="_blank" rel="noopener noreferrer">{row.link}</a><br />
            {row.city && <><strong>Ciudad:</strong> {row.city}<br /></>}
            <strong>Contenido +18:</strong> {row.content18 === 'Sí' ? 'Sí' : 'No'}
          </Text>
        </Table.Td>
      </Table.Tr>
    </>
  ));

  return (
    <ScrollArea>
      <TextInput
        placeholder="Buscar por nombre, email, ciudad, categoría..."
        mb="md"
        leftSection={<IconSearch size={16} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} layout="fixed">
        <Table.Thead>
          <Table.Tr>
            <Th sorted={sortBy === 'name'} reversed={reverseSortDirection} onSort={() => setSorting('name')}>
              Nombre
            </Th>
            <Th sorted={sortBy === 'email'} reversed={reverseSortDirection} onSort={() => setSorting('email')}>
              Email
            </Th>
            <Th sorted={sortBy === 'categories'} reversed={reverseSortDirection} onSort={() => setSorting('categories')}>
              Categoría
            </Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text fw={500} ta="center">
                  No se encontraron resultados.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
