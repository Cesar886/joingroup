import { useForm } from '@mantine/form';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Title,
  Group,
  Stack,
  Modal,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useRef, useState } from 'react';

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

  const captchaRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [captchaValues, setCaptchaValues] = useState(null);

  const handleOpenCaptcha = () => {
    const isValid = form.validate();
    if (!isValid.hasErrors) {
      setModalOpen(true);
    }
  };

  const handleVerify = async (token) => {
    setCaptchaValues(token);
    setModalOpen(false);

    try {
      // Normalizar el link
      const rawLink = form.values.link.trim().toLowerCase();
      const cleanLink = rawLink.endsWith('/') ? rawLink.slice(0, -1) : rawLink;

      // Verificar duplicado
      const q = query(
        collection(db, 'groups'),
        where('link', '==', cleanLink)
      );
      const existing = await getDocs(q);

      if (!existing.empty) {
        showNotification({
          title: 'Enlace duplicado',
          message: 'Este grupo ya fue publicado antes 📌',
          color: 'red',
        });
        return;
      }

      // Guardar grupo
      await addDoc(collection(db, 'groups'), {
        ...form.values,
        link: cleanLink,
        destacado: false,
        visitas: 0,
        miembros: 0,
        createdAt: new Date(),
      });

      showNotification({
        title: 'Grupo enviado',
        message: 'Guardado correctamente. Será revisado pronto y en menos de 8 horas estará disponible.',
        color: 'green',
        position: 'top-right',
      });

      form.reset();
      setCaptchaValues(null);
    } catch (error) {
      console.error(error);
      showNotification({
        title: 'Error',
        message: 'No se pudo guardar.',
        color: 'red',
        position: 'top-right',
      });
    }
  };

  return (
    <>
      <Title order={2} mb="md">Publica tu Grupo</Title>
      <form onSubmit={(e) => e.preventDefault()}>
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
              'Noticias', 'Criptomonedas', 'Negocios y Finanzas', 'Desarrollo Personal',
              'Memes y Humor', '18+', 'Películas y Series', 'Tecnología', 'Programación',
              'Gaming', 'Ofertas y Descuentos', 'Emprendimiento', 'Libros y Lectura',
              'Salud y Bienestar', 'Fitness', 'Música', 'Viajes', 'Idiomas', 'Educación',
              'Oportunidades Laborales', 'Cursos y Tutoriales', 'Canales NSFW', 'Anime y Manga',
              'Arte y Diseño', 'Productividad', 'Relaciones y Citas', 'Fútbol', 'Trading',
              'Inversiones', 'Dropshipping', 'Telegram Bots', 'IA y ChatGPT', 'Hacking Ético',
            ]}
          />

          <Checkbox
            label="He leído y acepto las condiciones de uso y la privacidad"
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button onClick={handleOpenCaptcha} mt="md">Publicar</Button>
        </Stack>
      </form>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Verifica que no eres un bot"
        centered
      >
        <HCaptcha
          sitekey="71f4e852-9d22-4418-aef6-7c1c0a7c5b54"
          onVerify={handleVerify}
          ref={captchaRef}
        />
      </Modal>
    </>
  );
}