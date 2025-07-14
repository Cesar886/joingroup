import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useNavigate } from 'react-router-dom';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Text,
  Title,
  Stack,
  Modal,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useRef, useState } from 'react';
import slugify from '../assets/slugify';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { Helmet } from 'react-helmet';
import { IconBrandWhatsapp } from '@tabler/icons-react';

export default function ClanesGroupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const baseLang = i18n.language.split('-')[0]; // "en-US" → "en"
  const [game, setGame] = useState('Clash Royale');

  /* ─────────────────── Expresiones regulares ─────────────────── */
  const clashRoyaleClanRegex =
    /^https:\/\/link\.clashroyale\.com\/invite\/clan\//i;
  const clashOfClansClanRegex =
    /^https:\/\/link\.clashofclans\.com\/.+tag=/i;

  /* ───────────────────────── useForm ─────────────────────────── */
  const form = useForm({
    initialValues: {
      name: '',
      link: '',
      email: '',
      emailRepeat: '',
      descriptionEs: '',
      descriptionEn: '',
      city: '',
      categories: '',
      content18: '',
      acceptTerms: false,
    },
    validate: {
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : t('Email inválido'),
      emailRepeat: (v, vals) =>
        v === vals.email ? null : t('Los emails no coinciden'),
      acceptTerms: (v) =>
        v ? null : t('Debes aceptar los términos'),

      descriptionEs: (v, values) => {
        const lenEs = v.trim().length;
        const lenEn = values.descriptionEn.trim().length;
        return (lenEs >= 20 && lenEs <= 320) ||
          (lenEn >= 20 && lenEn <= 320)
          ? null
          : t(
              'Debes escribir una descripción en español o en inglés (20–320 caracteres)'
            );
      },
      descriptionEn: (v, values) => {
        const lenEn = v.trim().length;
        const lenEs = values.descriptionEs.trim().length;
        return (lenEn >= 20 && lenEn <= 320) ||
          (lenEs >= 20 && lenEs <= 320)
          ? null
          : t(
              'You must write a description in English or Spanish (20–320 characters)'
            );
      },
      link: (v) => {
        const val = v.trim();
        if (game === 'Clash Royale' && !clashRoyaleClanRegex.test(val))
          return t(
            'El enlace de invitación de Clash Royale no es válido'
          );
        if (game === 'Clash of Clans' && !clashOfClansClanRegex.test(val))
          return t(
            'El enlace de invitación de Clash of Clans no es válido'
          );
        return null;
      },
    },
  });

  /* ───────────────────────── Captcha ─────────────────────────── */
  const captchaRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  const DEEPL_PROXY_URL = 'https://daniel-rdz.tech/translate';

  async function translateText(text, source, target) {
    try {
      const res = await fetch(DEEPL_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target }),
      });
      if (!res.ok) return '';
      const data = await res.json();
      return data.translated;
    } catch {
      return '';
    }
  }

  /* ───────────── Auto‑traducción con debounce ───────────────── */
  const useDebouncedCallback = (callback, delay = 800) => {
    const timeout = useRef(null);
    return (...args) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => callback(...args), delay);
    };
  };

  const debouncedTranslate = useDebouncedCallback(async () => {
    const { descriptionEs, descriptionEn } = form.values;
    if (
      baseLang === 'es' &&
      descriptionEs.trim().length >= 20 &&
      !descriptionEn.trim()
    ) {
      const translated = await translateText(descriptionEs, 'ES', 'EN');
      form.setFieldValue('descriptionEn', translated);
    }
    if (
      baseLang === 'en' &&
      descriptionEn.trim().length >= 20 &&
      !descriptionEs.trim()
    ) {
      const translated = await translateText(descriptionEn, 'EN', 'ES');
      form.setFieldValue('descriptionEs', translated);
    }
  }, 900);

  const handleVerify = async (token) => {
    if (!token) return;
    setModalOpen(false);
    setIsLoading(true);

    try {
      /* 1. Normalizar link */
      const rawLink = form.values.link.trim();
      const cleanLink = rawLink.endsWith('/')
        ? rawLink.slice(0, -1)
        : rawLink;

      /* 2. Duplicado por link */
      const qLink = query(
        collection(db, 'clanes'),
        where('link', '==', cleanLink)
      );
      if (!(await getDocs(qLink)).empty) {
        showNotification({
          title: t('Enlace duplicado'),
          message: t('Este clan ya fue publicado antes 📌'),
          color: 'red',
        });
        return;
      }

      /* 3. Duplicado por slug */
      const slug = slugify(form.values.name);
      const qSlug = query(
        collection(db, 'clanes'),
        where('slug', '==', slug)
      );
      if (!(await getDocs(qSlug)).empty) {
        showNotification({
          title: t('Nombre duplicado'),
          message: t('Ya existe un clan con ese nombre 📌'),
          color: 'red',
        });
        return;
      }

      const tipo = game.toLowerCase().replace(/\s+/g, '-');

      /* 4. Alta en Firestore */
      const {
        descriptionEs,
        descriptionEn,
        ...plainValues
      } = form.values;

      const docRef = await addDoc(collection(db, 'clanes'), {
        ...plainValues,
        juego: game.toLowerCase().replace(/\s+/g, '-'), // clash-royale | clash-of-clans
        description: {
          es: descriptionEs.trim(),
          en: descriptionEn.trim(),
        },
        link: cleanLink,
        destacado: false,
        visitas: 0,
        createdAt: new Date(),
        slug,
        tipo,
        translationPending:
          !descriptionEs.trim() || !descriptionEn.trim(),
      });

      showNotification({
        title: t('¡Éxito!'),
        message: t('Clan publicado correctamente'),
        color: 'green',
      });

      /* 5. Traducción automática (opcional) */
      if (!descriptionEs.trim() || !descriptionEn.trim()) {
        const text = descriptionEs.trim() || descriptionEn.trim();
        const source = descriptionEs.trim() ? 'ES' : 'EN';
        const target = descriptionEs.trim() ? 'EN' : 'ES';

        let attempts = 0;
        const intervalId = setInterval(async () => {
          attempts += 1;
          try {
            const translated = await translateText(text, source, target);
            if (translated && translated.length >= 20) {
              await updateDoc(docRef, {
                [`description.${target.toLowerCase()}`]: translated,
                translationPending: false,
              });
              clearInterval(intervalId);
            }
          } catch {
            /* ignore */
          }
          if (attempts > 60) clearInterval(intervalId);
        }, 5000);
      }

      /* 6. Reset + navegación */
      form.reset();
      navigate(`/clanes/clanes-de-${game.toLowerCase().replace(/\s+/g, '-')}/${slug}`);
    } catch (error) {
      console.error(error);
      showNotification({
        title: t('Error'),
        message: t('No se pudo guardar.'),
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────────────── Render ──────────────────────────── */
  return (
    <>
      <Helmet>
        <title>{`Publicar Clan de ${game} | Gratis en JoinGroups 2025`}</title>
        <meta
          name="description"
          content={`Envía tu clan de ${game} para ser listado en nuestro directorio verificado.`}
        />
        <link
          rel="canonical"
          href="https://joingroups.pro/clanes/form"
        />
      </Helmet>

      <Stack spacing="sm" mb="md">
        <Title order={2}>
          {t('Publica tu Clan')}
        </Title>

        <Button
          leftIcon={<IconBrandWhatsapp size={18} />}
          variant="outline"
          color="blue"
          component="a"
          href="https://wa.me/5212284935831?text=Hola%2C%20me%20gustaría%20sugerir%20un%20nuevo%20juego%20para%20los%20clanes%20en%20JoinGroups"
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
        >
          {t('¿Quieres que agreguemos otro juego? Comunícate con nosotros')}
        </Button>
      </Stack>


      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.validate().hasErrors) setModalOpen(true);
        }}
      >
        <Stack>
          {/* Juego */}
          <Select
            label="Juego"
            placeholder="Selecciona un juego"
            data={['Clash Royale', 'Clash of Clans']}
            value={game}
            onChange={setGame}
            allowDeselect={false}
          />

          {/* Nombre */}
          <TextInput
            label={t('Nombre del Clan')}
            required
            {...form.getInputProps('name')}
          />

          {/* Link */}
          <TextInput
            label={t('Enlace de invitación')}
            placeholder={
              game === 'Clash Royale'
                ? 'https://link.clashroyale.com/invite/clan/...'
                : 'https://link.clashofclans.com/en?...tag=YOURTAG'
            }
            required
            {...form.getInputProps('link')}
          />

          {/* Feedback visual del link */}
          {form.values.link && (
            <Text
              size="xs"
              c={
                (game === 'Clash Royale' &&
                  clashRoyaleClanRegex.test(
                    form.values.link.trim()
                  )) ||
                (game === 'Clash of Clans' &&
                  clashOfClansClanRegex.test(
                    form.values.link.trim()
                  ))
                  ? 'green'
                  : 'red'
              }
            >
              {game === 'Clash Royale' &&
                clashRoyaleClanRegex.test(
                  form.values.link.trim()
                ) &&
                t('Enlace válido de clan (Clash Royale)')}
              {game === 'Clash of Clans' &&
                clashOfClansClanRegex.test(
                  form.values.link.trim()
                ) &&
                t('Enlace válido de clan (Clash of Clans)')}
              {!(
                (game === 'Clash Royale' &&
                  clashRoyaleClanRegex.test(
                    form.values.link.trim()
                  )) ||
                (game === 'Clash of Clans' &&
                  clashOfClansClanRegex.test(
                    form.values.link.trim()
                  ))
              ) && t('Enlace no válido de clan')}
            </Text>
          )}

          {/* Email */}
          <TextInput
            label={t('Tu e‑mail')}
            placeholder="email@email.com"
            required
            {...form.getInputProps('email')}
          />
          <TextInput
            label={t('Repite tu e‑mail')}
            required
            {...form.getInputProps('emailRepeat')}
          />

          {/* Descripción ES / EN */}
          <Textarea
            label="Descripción (Español)"
            placeholder="⌨ Máximo 320 caracteres"
            required={baseLang === 'es'}
            autosize
            minRows={3}
            style={{
              display: baseLang === 'es' ? 'block' : 'none',
            }}
            value={form.values.descriptionEs}
            onChange={(e) => {
              form.setFieldValue(
                'descriptionEs',
                e.currentTarget.value
              );
              debouncedTranslate();
            }}
            error={form.errors.descriptionEs}
          />

          <Textarea
            label="Description (English)"
            placeholder="⌨ Maximum 320 characters"
            required={baseLang === 'en'}
            autosize
            minRows={3}
            style={{
              display: baseLang === 'en' ? 'block' : 'none',
            }}
            value={form.values.descriptionEn}
            onChange={(e) => {
              form.setFieldValue(
                'descriptionEn',
                e.currentTarget.value
              );
              debouncedTranslate();
            }}
            error={form.errors.descriptionEn}
          />

          {/* Ciudad (opcional) */}
          <TextInput
            label={t('Tu ciudad (opcional)')}
            {...form.getInputProps('city')}
          />

          {/* Categorías */}
          <Select
            label={t('Categorías')}
            placeholder={t('Selecciona una categoría')}
            {...form.getInputProps('categories')}
            data={[
              'Competitivo',
              'Casual',
              'Guerras de clanes',
              'Farming',
              'Esports',
            ]}
          />

          {/* Términos */}
          <Checkbox
            label={t(
              'He leído y acepto las condiciones de uso y la privacidad'
            )}
            required
            {...form.getInputProps('acceptTerms', {
              type: 'checkbox',
            })}
          />

          {/* Botón */}
          <Button
            type="submit"
            mt="md"
            loading={isLoading}
            loaderProps={{ type: 'dots' }}
          >
            {t('Publicar')}
          </Button>
        </Stack>
      </form>

      {/* Modal captcha */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('Verifica que no eres un bot')}
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
