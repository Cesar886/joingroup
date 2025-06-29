import { Button, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import classes from './404.module.css';

export default function NotFoundImage() {
  const navigate = useNavigate();

  return (
    <Container className={classes.root}>
      <SimpleGrid
        spacing={{ base: 40, sm: 80 }}
        cols={{ base: 1, sm: 2 }}
        verticalSpacing={50}
      >
        {/* Contenido principal */}
        <div>
          <Title className={classes.title}>¡Oops! Página no encontrada</Title>

          <Text c="dimmed" size="lg" mt="md">
            Parece que esta página no existe o fue movida. Tal vez escribiste mal la
            dirección o el enlace está roto.
            <br />
            Puedes regresar al inicio y seguir explorando los grupos más 🔥.
          </Text>

          <Button
            variant="light"
            color="indigo"
            size="md"
            mt="xl"
            className={classes.control}
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </div>

        {/* Imagen escritorio (derecha en ≥ 768 px) */}
        <Image
          src="/404.avif"
          alt="404 Not Found"
          className={classes.desktopImage}
          radius="md"
          fit="contain"
        />

        {/* Imagen móvil */}
        <Image
          src="/404.avif"
          alt="404 Not Found"
          className={classes.mobileImage}
          radius="md"
          fit="contain"
        />
      </SimpleGrid>
    </Container>
  );
}
