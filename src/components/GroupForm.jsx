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
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useRef, useState } from 'react';
import slugify from '../assets/slugify'
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';



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
      email:  (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : t('Email inválido')),
      emailRepeat: (v, vals) => v === vals.email ? null : t('Los emails no coinciden'),
      acceptTerms: (v) => v ? null : t('Debes aceptar los términos'),

      // 320 car máx. en cada idioma:
      descriptionEs: (v, values) => {
        const hasEs = v.trim().length >= 20 && v.trim().length <= 320;
        const hasEn = values.descriptionEn.trim().length >= 20 && values.descriptionEn.trim().length <= 320;
        return hasEs || hasEn
          ? null
          : t('Debes escribir una descripción en español o en inglés (20–320 caracteres)');
      },

      descriptionEn: (v, values) => {
        const hasEn = v.trim().length >= 20 && v.trim().length <= 320;
        const hasEs = values.descriptionEs.trim().length >= 20 && values.descriptionEs.trim().length <= 320;
        return hasEn || hasEs
          ? null
          : t('You must write a description in English or Spanish (20–320 characters)');
      },

      link: (v) => {
        const validTelegram = v.startsWith('https://t.me/');
        const validWhatsapp = v.startsWith('https://chat.whatsapp.com/');
        if (redSocial === 'Telegram' && !validTelegram) {
          return t('El enlace debe comenzar con https://t.me/');
        }
        if (redSocial === 'Whatsapp' && !validWhatsapp) {
          return t('El enlace debe comenzar con https://chat.whatsapp.com/');
        }
        return null;
      },
    },
  });


  const captchaRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [captchaValues, setCaptchaValues] = useState(null);
  const [activeLang] = useState(baseLang);


  const handleOpenCaptcha = () => {
    const validation = form.validate(); // ✅ Asigna correctamente
    if (!validation.hasErrors) {
      setModalOpen(true);
    }
  };

  const handleVerify = async (token) => {
    setCaptchaValues(token);
    setModalOpen(false);
    setIsLoading(true); 

    try {
      const rawLink = form.values.link.trim();
      const cleanLink = rawLink.endsWith('/') ? rawLink.slice(0, -1) : rawLink;

      const q = query(collection(db, 'groups'), where('link', '==', cleanLink));
      const existing = await getDocs(q);

      if (!existing.empty) {
        showNotification({
          title: t('Enlace duplicado'),
          message: t('Este grupo ya fue publicado antes 📌'),
          color: 'red',
        });
        return;
      }

      const slug = slugify(form.values.name);
      const qSlug = query(collection(db, 'groups'), where('slug', '==', slug));
      const slugSnap = await getDocs(qSlug);

      if (!slugSnap.empty) {
        showNotification({
          title: t('Nombre duplicado'),
          message: t('Ya existe un grupo con ese nombre 📌'),
          color: 'red',
        });
        return;
      }

      let descEs = form.values.descriptionEs.trim();
      let descEn = form.values.descriptionEn.trim();

      const {
        descriptionEs,
        descriptionEn,
        ...cleanValues
      } = form.values;

      const docRef = await addDoc(collection(db, 'groups'), {
        ...cleanValues,
        tipo: redSocial.toLowerCase(), // ← esto guarda si es telegram o whatsapp
        description: {
          es: descEs || '',
          en: descEn || '',
        },
        link: cleanLink,
        destacado: false,
        visitas: 0,
        miembros: 0,
        createdAt: new Date(),
        slug,
        translationPending: !descEs || !descEn,
      });

      form.reset();
      setCaptchaValues(null);
      navigate(`/${redSocial.toLowerCase()}/${slug}`);


      // 👇 Traducción automática post-envío
      if (!descEs || !descEn) {
        const text = descEs || descEn;
        const source = descEs ? 'ES' : 'EN';
        const target = descEs ? 'EN' : 'ES';

        let attempts = 0;
        let consecutiveFailures = 0;
        const maxAttempts = 80;
        const maxConsecutiveFailures = 10;
        const retryIntervalMs = 5000;

        const intervalId = setInterval(async () => {
          attempts++;

          try {
            const translated = await translateText(text, source, target);

            if (translated && translated.length >= 20) {
              await updateDoc(docRef, {
                [`description.${target.toLowerCase()}`]: translated,
                translationPending: false,
              });
              console.log(`✅ Traducción exitosa en intento ${attempts}`);
              clearInterval(intervalId); // ✅ Detenemos
              return;
            }

            console.warn(`⚠ Traducción vacía o muy corta. Intento ${attempts}`);
            consecutiveFailures++;
          } catch (e) {
            consecutiveFailures++;
            console.error(`❌ Fallo al traducir (intento ${attempts}):`, e.message);
          }

          if (attempts >= maxAttempts || consecutiveFailures >= maxConsecutiveFailures) {
            console.warn('⛔ Se alcanzó el máximo de intentos o errores consecutivos');
            clearInterval(intervalId);
          }
        }, retryIntervalMs);

      }
    } catch (error) {
      console.error(error);
      setIsLoading(false); 
      showNotification({
        title: t('Error'),
        message: t('No se pudo guardar.'),
        color: 'red',
        position: 'top-right',
      });
    }
  };



  const DEEPL_PROXY_URL = 'https://daniel-rdz.tech/translate'; // Con Https://daniel-rdz.tech/translate


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
        title: t('Traducción no disponible'),
        message: t('No se pudo traducir automáticamente. Escribe la traducción manualmente.'),
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

   const [redSocial, setRedSocial] = useState('Telegram');

    const prefix = redSocial === 'Telegram'
      ? 'https://t.me/'
      : 'https://chat.whatsapp.com/';



  return (
    <>
      <Title order={2} mb="md">{t('Publica tu Grupo')}</Title>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const validation = form.validate();
            if (!validation.hasErrors) {
              setModalOpen(true); // Abre el modal con el captcha real
            }
          }}
        >
         <Stack>
          <TextInput
            label={t(`Nombre del Grupo de ${redSocial}`)}
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label={t("Enlace de invitación")}
            placeholder={prefix}
            required
            value={form.values.link}
            onChange={(event) => {
              const input = event.currentTarget.value;
              const typedPrefix = input.slice(0, prefix.length);
              const rest = input.slice(prefix.length);

              // Compara ignorando mayúsculas, pero conserva el input original
              if (typedPrefix.toLowerCase() !== prefix.toLowerCase() && prefix.toLowerCase().startsWith(typedPrefix.toLowerCase())) {
                form.setFieldValue('link', prefix + rest);
              } else {
                form.setFieldValue('link', input);
              }
            }}
            {...form.getInputProps('link')}
          />


          <Select
            label="Red social"
            placeholder="Selecciona una red"
            data={['Telegram', 'Whatsapp']}
            value={redSocial}
            onChange={setRedSocial}
            allowDeselect={false}
          />


          <Select
            label={t("¿ACEPTAS CONTENIDO SEXUAL o PARA ADULTOS?")}
            data={[t('Sí'), t('No')]}
            required
            {...form.getInputProps('content18')}
          />

          <TextInput
            label={t("Tu e-mail")}
            placeholder="email@email.com"
            required
            {...form.getInputProps('email')}
          />

          <TextInput
            label={t("Repite tu e-mail")}
            required
            {...form.getInputProps('emailRepeat')}
          />

          <Textarea
              label="Descripción (Español)"
              placeholder="⌨ Máximo 320 caracteres"
              required={baseLang === 'es'}
              autosize
              minRows={3}
              style={{ display: baseLang === 'es' ? 'block' : 'none' }}
              value={form.values.descriptionEs}
              onChange={(e) => {
                form.setFieldValue('descriptionEs', e.currentTarget.value);
                debouncedTranslate();
              }}
              error={form.errors.descriptionEs}
            />

            {/* Inglés siempre presente, pero oculto si no es el idioma activo */}
            <Textarea
              label="Description (English)"
              placeholder="⌨ Maximum 320 characters"
              required={baseLang === 'en'}
              autosize
              minRows={3}
              style={{ display: baseLang === 'en' ? 'block' : 'none' }}
              value={form.values.descriptionEn}
              onChange={(e) => {
                form.setFieldValue('descriptionEn', e.currentTarget.value);
                debouncedTranslate();
              }}
              error={form.errors.descriptionEn}
            />
          <TextInput
            label={t("Tu ciudad (opcional)")}
            {...form.getInputProps('city')}
          />

          <Select
            label={t("Categorías")}
            placeholder={t("Selecciona una categoría")}
            required
            {...form.getInputProps('categories')}
            data={[
              'Hot',
              'Anime y Manga',
              t('Películas y Series'),
              t('Criptomonedas'),
              'Xxx',
              'Hacking',
              t('Memes y Humor'),
              'Stickers',
              t('Porno'),
              t('Canales NSFW'),
              '18+',
              t('Fútbol'),
              t('Tecnología'),
              t('Programación'),
              'Gaming',
              t('Cursos y Tutoriales'),
              t('Negocios y Finanzas'),
              'Packs',
              'Trading',
              t('Ofertas y Descuentos'),
              t('Emprendimiento'),
              t('Relaciones y Citas'),
              'Telegram Bots'
            ]}
          />

          <Checkbox
            label={t("He leído y acepto las condiciones de uso y la privacidad")}
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button type="submit" mt="md" loading={isLoading} loaderProps={{ type: 'dots' }}>
            {t('Publicar')}
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


