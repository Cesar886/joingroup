import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  collection, query, where, getDocs,
  doc, increment, limit, runTransaction, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Box, Button, Center, Container, Divider,
  Group, Paper, Stack, Text, Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import slugify from '../assets/slugify';     // ⬅️ el mismo helper que usas en TableSort

export default function GroupDetail() {
  const { id } = useParams();                // id === slug recibido en la URL
  const [group, setGroup]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        // 1️⃣  Intenta encontrar por slug
        const q = query(
          collection(db, 'groups'),
          where('slug', '==', id),
          limit(1)
        );
        let snap = await getDocs(q);

        // 2️⃣  Si no hay slug en esos docs viejos, busca por nombre “slugificado”
        if (snap.empty) {
          const allQ = query(collection(db, 'groups'), limit(1000)); // o por páginas
          const allSnap = await getDocs(allQ);
          snap = allSnap.docs.filter(d => slugify(d.data().name) === id);
        } else {
          snap = snap.docs;
        }

        if (snap.length === 0) {
          setNotFound(true);
          return;
        }

        const docSnap = snap[0];
        const docRef  = docSnap.ref;
        const data    = docSnap.data();

        // 3️⃣  Si el documento no traía slug, lo actualizamos aquí mismo
        if (!data.slug) {
          await updateDoc(docRef, { slug: slugify(data.name) });
        }

        /* -------------------  visitas ------------------- */
        const visitKey   = `visitado-${id}`;
        const yaVisitado = sessionStorage.getItem(visitKey);

        if (!yaVisitado) {
          await runTransaction(db, async (trx) => {
            const fresh = await trx.get(docRef);
            const v = fresh.data()?.visitas || 0;
            trx.update(docRef, { visitas: v + 1 });
          });
          sessionStorage.setItem(visitKey, 'true');
        }

        setGroup({ id: docSnap.id, ...data, slug: data.slug || slugify(data.name) });

      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  /* -------------- render -------------- */
  if (loading)   return <Center><Text>Cargando grupo...</Text></Center>;
  if (notFound || !group)
    return <Center><Text>Grupo no encontrado.</Text></Center>;

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
              Recuerda: evita compartir información personal en <strong>{group.name}</strong>. Nunca se sabe quién puede estar leyendo. Mantengamos <strong>{group.name}</strong> como un espacio seguro y agradable para todos.
            </Text>
          </Box>

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

          <Button
            component="a"
            href={group.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
            variant="filled"
            color="blue"
            disabled={!group.link}
          >
            {group.link ? 'Telegram - ACCEDER AL GRUPO' : 'Enlace no disponible'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );

  /* ------------------ helpers ------------------ */
  async function sendTelegramMessage(tipo) {
    const chatId = -1002622285468
    const token  = "7551745963:AAFiTkb9UehxZMXNINihI8wSdlTMjaM6Lfk"

    const url    = window.location.href;

    const text = `🚨 *Nuevo: ${tipo}*\nGrupo: ${group?.name}\nURL: ${url}`;

    try {
      const res  = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.description);
      showNotification({ title: 'Reporte enviado', message: '¡Gracias!', color: 'green' });
    } catch (e) {
      console.error(e);
      showNotification({ title: 'Error', message: 'No se pudo enviar.', color: 'red' });
    }
  }
}
