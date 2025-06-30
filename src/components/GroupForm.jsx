import { useForm } from '@mantine/form';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useNavigate } from 'react-router-dom';
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
import slugify from '../assets/slugify'
import { SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';


export default function GroupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const baseLang = i18n.language.split('-')[0]; // "en-US" → "en"
  const form = useForm({
    initialValues: {
      name: '',
      link: '',
      email: '',
      emailRepeat: '',
      descriptionEs: '',   // 🆕
      descriptionEn: '',   // 🆕
      city: '',
      content18: '',
      categories: '',
      acceptTerms: false,
    },
    validate: {
      email:  (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Email inválido'),
      emailRepeat: (v, vals) => v === vals.email ? null : 'Los emails no coinciden',
      acceptTerms: (v) => v ? null : 'Debes aceptar los términos',

      // 320 car máx. en cada idioma:
      descriptionEs: (v, values) => {
        const hasEs = v.trim().length >= 20 && v.trim().length <= 320;
        const hasEn = values.descriptionEn.trim().length >= 20 && values.descriptionEn.trim().length <= 320;
        return hasEs || hasEn
          ? null
          : 'Debes escribir una descripción en español o en inglés (20–320 caracteres)';
      },

      descriptionEn: (v, values) => {
        const hasEn = v.trim().length >= 20 && v.trim().length <= 320;
        const hasEs = values.descriptionEs.trim().length >= 20 && values.descriptionEs.trim().length <= 320;
        return hasEn || hasEs
          ? null
          : 'You must write a description in English or Spanish (20–320 characters)';
      },

      link: (v) =>
        v.startsWith('https://t.me/')
          ? null
          : 'El enlace debe comenzar con https://t.me/',
    },
  });


  const captchaRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [captchaValues, setCaptchaValues] = useState(null);
  const [activeLang] = useState(baseLang);


  const handleOpenCaptcha = () => {
    const validation = form.validate(); // ✅ Asigna correctamente
    console.log('¿Formulario válido?', !validation.hasErrors);
    console.log('Errores de validación:', validation.errors); // ✅ Ahora sí existe
    if (!validation.hasErrors) {
      setModalOpen(true);
    }
  };

  const handleVerify = async (token) => {
    setCaptchaValues(token);
    setModalOpen(false);
    setIsLoading(true); 

    try {
      const rawLink = form.values.link.trim().toLowerCase();
      const cleanLink = rawLink.endsWith('/') ? rawLink.slice(0, -1) : rawLink;

      const q = query(collection(db, 'groups'), where('link', '==', cleanLink));
      const existing = await getDocs(q);

      if (!existing.empty) {
        showNotification({
          title: 'Enlace duplicado',
          message: 'Este grupo ya fue publicado antes 📌',
          color: 'red',
        });
        return;
      }

      const slug = slugify(form.values.name);
      const qSlug = query(collection(db, 'groups'), where('slug', '==', slug));
      const slugSnap = await getDocs(qSlug);

      if (!slugSnap.empty) {
        showNotification({
          title: 'Nombre duplicado',
          message: 'Ya existe un grupo con ese nombre 📌',
          color: 'red',
        });
        return;
      }

      let descEs = form.values.descriptionEs.trim();
      let descEn = form.values.descriptionEn.trim();

      if (!descEn && descEs.length >= 20) {
        descEn = await translateText(descEs, 'ES', 'EN');
      }
      if (!descEs && descEn.length >= 20) {
        descEs = await translateText(descEn, 'EN', 'ES');
      }

      const {
        descriptionEs,
        descriptionEn,
        ...cleanValues
      } = form.values;

      await addDoc(collection(db, 'groups'), {
        ...cleanValues, // sin descriptionEs ni descriptionEn
        description: {
          es: descEs,
          en: descEn,
        },
        link: cleanLink,
        destacado: false,
        visitas: 0,
        miembros: 0,
        createdAt: new Date(),
        slug,
      });

      form.reset();
      setCaptchaValues(null);
      console.log('publicando...')
      navigate(`/grupo/${slug}`); // ✅ Redirige al grupo recién creado
    } catch (error) {
      console.error(error);
      setIsLoading(false); 
      showNotification({
        title: 'Error',
        message: 'No se pudo guardar.',
        color: 'red',
        position: 'top-right',
      });
    }
  };


  const DEEPL_PROXY_URL = 'http://137.184.102.7:3030/translate'; // sin HTTPS si no tienes SSL


  async function translateText(text, source, target) {
    try {
      const res = await fetch(DEEPL_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`HTTP ${res.status}: ${err}`);
      }

      const data = await res.json();
      return data.translated;  // Aquí está el cambio importante
    } catch (e) {
      console.warn('DeepL error:', e.message);
      showNotification({
        title: 'Traducción no disponible',
        message: 'No se pudo traducir automáticamente. Escribe la traducción manualmente.',
        color: 'yellow',
      });
      return '';
    }
  }


  function useDebouncedCallback(callback, delay = 800) {
    const timeout = useRef(null);

    return (...args) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => callback(...args), delay);
    };
  }
  

  const debouncedTranslate = useDebouncedCallback(async () => {
    const { descriptionEs, descriptionEn } = form.values;

    // Si la UI está en español y falta el inglés…
    if (baseLang === 'es' && descriptionEs.trim().length >= 20 && !descriptionEn.trim()) {
      const translated = await translateText(descriptionEs, 'ES', 'EN');
      form.setFieldValue('descriptionEn', translated);
    }

    // Si la UI está en inglés y falta el español…
    if (baseLang === 'en' && descriptionEn.trim().length >= 20 && !descriptionEs.trim()) {
      const translated = await translateText(descriptionEn, 'EN', 'ES');
      form.setFieldValue('descriptionEs', translated);
    }
  }, 900);          // 900 ms tras la última tecla



  return (
    <>
      <Title order={2} mb="md">Publica tu Grupo</Title>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const validation = form.validate();
            if (!validation.hasErrors) {
              await handleVerify('dev-bypass'); // ✅ ahora sí espera el proceso completo
            }
          }}
        >
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
            value={form.values.link}
            onChange={(event) => {
              const input = event.currentTarget.value;

              const prefix = 'https://t.me/';
              const typedPrefix = input.slice(0, prefix.length).toLowerCase();
              const rest = input.slice(prefix.length);

              // Corrige automáticamente el inicio si coincide parcialmente
              if (typedPrefix !== prefix && prefix.startsWith(typedPrefix)) {
                form.setFieldValue('link', prefix + rest);
              } else {
                form.setFieldValue('link', input);
              }
            }}
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
          {/* Si la UI está en español */}
          {baseLang === 'es' ? (
            <Textarea
              label="Descripción"
              placeholder="⌨ Máximo 320 caracteres"
              required
              autosize
              minRows={3}
              value={form.values.descriptionEs}
              onChange={(e) => {
                form.setFieldValue('descriptionEs', e.currentTarget.value);
                debouncedTranslate();
              }}
              error={form.errors.descriptionEs}
            />
          ) : (
            /* Si la UI está en inglés */
            <Textarea
              label="Description"
              placeholder="⌨ Maximum 320 characters"
              required
              autosize
              minRows={3}
              value={form.values.descriptionEn}
              onChange={(e) => {
                form.setFieldValue('descriptionEn', e.currentTarget.value);
                debouncedTranslate();
              }}
              error={form.errors.descriptionEn}
            />
          )}

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
              'Hot',
              'Anime y Manga',
              'Películas y Series',
              'Criptomonedas',
              'XXX',
              'Hacking',
              'Memes y Humor',
              'Porno',
              'Canales NSFW',
              '18+',
              'Fútbol',
              'Tecnología',
              'Programación',
              'Gaming',
              'Cursos y Tutoriales',
              'Negocios y Finanzas',
              'Packs',
              'Trading',
              'Ofertas y Descuentos',
              'Emprendimiento',
              'Relaciones y Citas',
              'Telegram Bots'
            ]}
          />

          <Checkbox
            label="He leído y acepto las condiciones de uso y la privacidad"
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button type="submit" mt="md" loading={isLoading}>
            Publicar
          </Button>
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