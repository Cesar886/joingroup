import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications'; // ✅ IMPORTAR ESTO

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const fetchGroup = async () => {
      const docRef = doc(collection(db, 'groups'), id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          visitas: increment(1),
        });
        const updatedSnap = await getDoc(docRef);
        setGroup(updatedSnap.data());
      }
    };
    fetchGroup();
  }, [id]);

  const sendTelegramMessage = async (tipo) => {
    const chatId = '-1002622285468';
    const token = '7551745963:AAFiTkb9UehxZMXNINihI8wSdlTMjaM6Lfk';
    const url = window.location.href;

    const message = `🚨 *Nuevo: ${tipo}*\nGrupo ID: ${id}\nURL: ${url}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        showNotification({
          title: 'Reporte enviado ✅',
          message: `Se notificó correctamente: ${tipo}`,
          color: 'green',
        });
      } else {
        throw new Error(data.description || 'Fallo al enviar');
      }
    } catch (error) {
      console.error(error);
      showNotification({
        title: 'Error al reportar ❌',
        message: 'No se pudo enviar el reporte.',
        color: 'red',
      });
    }
  };

  if (!group) return <Center><Text>Cargando grupo...</Text></Center>;

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="sm" radius="md" p="lg">
        <Stack spacing="md">
          <Title order={2}>{group.name}</Title>
          <Text size="sm" c="dimmed">
            El grupo tiene <strong>{group.visitas || 0} visitas</strong>
          </Text>

          <Divider my="sm" />

          <Box>
            <Text fw={600} mb={4}>Descripción:</Text>
            <Text>{group.description}</Text>
          </Box>

          <Box mt="md" bg="#f9f9f9" p="md" radius="md" style={{ borderLeft: '4px solid #f03e3e' }}>
            <Text size="sm" c="dimmed">
              Recuerda: evita compartir información personal en el grupo <strong>{group.name}</strong>. <br />
              ¡Pásala bien y asegúrate de compartir solo contenido legal y respetuoso!
            </Text>
          </Box>

          <Text size="sm" c="dimmed" mt="xs">
            Disfruta del grupo: <strong>{group.name}</strong>.
          </Text>

          <Group justify="space-between" mt="md">
            <Button
              variant="light"
              color="red"
              size="xs"
              onClick={() => sendTelegramMessage('Enlace roto')}
            >
              Enlace roto
            </Button>
            <Button
              variant="outline"
              color="gray"
              size="xs"
              onClick={() => sendTelegramMessage('Reporte')}
            >
              Reportar
            </Button>
          </Group>

          <Divider my="sm" />

          <Box>
            <Button
              component="a"
              href={group.link}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              variant="filled"
              color="blue"
            >
              Telegram - ACCEDER AL GRUPO
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
