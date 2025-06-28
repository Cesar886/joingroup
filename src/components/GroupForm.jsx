import { useForm } from '@mantine/form';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Title,
  Group,
  Stack,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function GroupForm() {
  const form = useForm({
    initialValues: {
      name: '',
      link: '',
      email: '',
      emailRepeat: '',
      description: '',
      city: '',
      content18: '',
      categories: '',
      acceptTerms: false,
    },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Email inválido'),
      emailRepeat: (v, vals) => v === vals.email ? null : 'Los emails no coinciden',
      acceptTerms: (v) => v ? null : 'Debes aceptar los términos',
      link: (v) =>
        v.startsWith('https://t.me/')
          ? null
          : 'El enlace debe comenzar con https://t.me/',
      description: (v) =>
        v.trim().length >= 20
          ? null
          : 'La descripción debe tener al menos 20 caracteres',
    },
  });

  const handleSubmit = async (values) => {
    try {
      await addDoc(collection(db, 'groups'), values);
      showNotification({
        title: 'Grupo enviado',
        message: 'Guardado en Firebase ✅',
        color: 'green',
      });
      form.reset();
    } catch (error) {
      console.error(error);
      showNotification({
        title: 'Error',
        message: 'No se pudo guardar en Firebase.',
        color: 'red',
      });
    }
  };

  return (
    <>
      <Title order={2} mb="md">Publica tu Grupo</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Nombre del Grupo de Telegram"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Enlace de invitación"
            placeholder="https://t.me/..."
            required
            {...form.getInputProps('link')}
          />

          <Select
            label="¿ACEPTAS CONTENIDO SEXUAL o PARA ADULTOS?"
            data={['Sí', 'No']}
            required
            {...form.getInputProps('content18')}
          />

          <TextInput
            label="Tu e-mail"
            placeholder="email@email.com"
            required
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Repite tu e-mail"
            required
            {...form.getInputProps('emailRepeat')}
          />

          <Textarea
            label="Descripción del grupo"
            placeholder="⌨ Mínimo 60 caracteres"
            minRows={4}
            required
            {...form.getInputProps('description')}
          />

          <TextInput
            label="Tu ciudad (opcional)"
            {...form.getInputProps('city')}
          />

          <Select
            label="Categorías"
            placeholder="Selecciona una categoría"
            required
            {...form.getInputProps('categories')}
            data={[
              'Noticias',
              'Criptomonedas',
              'Negocios y Finanzas',
              'Desarrollo Personal',
              'Memes y Humor',
              '18+',
              'Películas y Series',
              'Tecnología',
              'Programación',
              'Gaming',
              'Ofertas y Descuentos',
              'Emprendimiento',
              'Libros y Lectura',
              'Salud y Bienestar',
              'Fitness',
              'Música',
              'Viajes',
              'Idiomas',
              'Educación',
              'Oportunidades Laborales',
              'Cursos y Tutoriales',
              'Canales NSFW',
              'Anime y Manga',
              'Arte y Diseño',
              'Productividad',
              'Relaciones y Citas',
              'Fútbol',
              'Trading',
              'Inversiones',
              'Dropshipping',
              'Telegram Bots',
              'IA y ChatGPT',
              'Hacking Ético',
            ]}
          />

          <Checkbox
            label="He leído y acepto las condiciones de uso y la privacidad"
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button type="submit" mt="md">Publicar</Button>
        </Stack>
      </form>
    </>
  );
}
