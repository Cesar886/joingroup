import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Checkbox,
  Container,
  Paper,
  Stack,
  Text,
  Title,
  TextInput,
  Button,
  Group,
  PasswordInput,
} from '@mantine/core';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const snapshot = await getDocs(collection(db, 'pwd'));
    const creds = snapshot.docs.map(doc => doc.data());
    const match = creds.find(
      (c) => c.email === email && c.password === password
    );
    if (match) setAuthenticated(true);
    else alert('Credenciales incorrectas');
  };

  useEffect(() => {
    if (authenticated) {
      const fetchGroups = async () => {
        const snapshot = await getDocs(collection(db, 'groups'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(data);
      };
      fetchGroups();
    }
  }, [authenticated]);

  const toggleDestacado = async (id, current) => {
    const ref = doc(db, 'groups', id);
    await updateDoc(ref, { destacado: !current });
    setGroups(groups.map(g => g.id === id ? { ...g, destacado: !current } : g));
  };

  if (!authenticated) {
    return (
      <Container size="xs" py="xl">
        <Title order={3} mb="md">Iniciar sesión (Admin)</Title>
        <Stack>
          <TextInput label="Correo" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
          <PasswordInput label="Contraseña" value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
          <Button onClick={handleLogin}>Entrar</Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="md">Administrar Grupos Destacados</Title>
      <Stack>
        {groups.map((group) => (
          <Paper key={group.id} withBorder p="md" radius="md">
            <Text fw={600}>{group.name}</Text>
            <Checkbox
              mt="xs"
              label="Grupo destacado"
              checked={group.destacado || false}
              onChange={() => toggleDestacado(group.id, group.destacado)}
            />
          </Paper>
        ))}
      </Stack>
    </Container>
  );
}