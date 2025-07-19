import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  TextInput,
  Textarea,
  Select,
  Checkbox,
  Button,
  Text,
  Title,
  MultiSelect,
  Stack,
  Modal,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import slugify from '../assets/slugify';
import { useTranslation } from 'react-i18next';
import { useForm } from '@mantine/form';
import { Helmet } from 'react-helmet';
import { IconBrandWhatsapp } from '@tabler/icons-react';

export default function GroupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { t, i18n } = useTranslation();
  const baseLang = i18n.language.split('-')[0];
  const [redSocial, setRedSocial] = useState('Telegram');
  const [modalOpen, setModalOpen] = useState(false);
  const captchaRef = useRef();
  const translationTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Memoizar las ciudades para evitar recreación en cada render
  const cities = useMemo(() => [
    { value: 'mx', label: 'México' },
    { value: 'us', label: 'Estados Unidos' },
    { value: 'ar', label: 'Argentina' },
    { value: 'co', label: 'Colombia' },
    { value: 'es', label: 'España' },
    { value: 'pe', label: 'Perú' },
    { value: 'cl', label: 'Chile' },
    { value: 've', label: 'Venezuela' },
    { value: 'br', label: 'Brasil' },
    { value: 'ec', label: 'Ecuador' },
    { value: 'gt', label: 'Guatemala' },
    { value: 'bo', label: 'Bolivia' },
    { value: 'do', label: 'República Dominicana' },
    { value: 'hn', label: 'Honduras' },
    { value: 'py', label: 'Paraguay' },
    { value: 'sv', label: 'El Salvador' },
    { value: 'ni', label: 'Nicaragua' },
    { value: 'cr', label: 'Costa Rica' },
    { value: 'pa', label: 'Panamá' },
    { value: 'uy', label: 'Uruguay' },
    { value: 'pr', label: 'Puerto Rico' },
    { value: 'ca', label: 'Canadá' },
    { value: 'de', label: 'Alemania' },
    { value: 'fr', label: 'Francia' },
    { value: 'it', label: 'Italia' },
    { value: 'gb', label: 'Reino Unido' },
    { value: 'nl', label: 'Países Bajos' },
    { value: 'pt', label: 'Portugal' },
    { value: 'jp', label: 'Japón' },
    { value: 'kr', label: 'Corea del Sur' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'ru', label: 'Rusia' },
    { value: 'au', label: 'Australia' },
  ], []);

  // Memoizar las categorías
  const categories = useMemo(() => [
    'Hot',
    t('NSFW'),
    'Anime y Manga',
    t('Películas y Series'),
    t('Porno'),
    t('Criptomonedas'),
    'Xxx',
    'Hacking',
    t('Memes y Humor'),
    '18+',
    t('Fútbol'),
    t('Tecnología'),
    t('Programación'),
    'Gaming',
    t('Cursos y Tutoriales'),
    t('Música y Podcasts'),
    t('Arte y Diseño'),
    t('Ciencia y Educación'),
    t('Negocios y Finanzas'),
    'Packs',
    'Trading',
    t('Ofertas y Descuentos'),
    t('Emprendimiento'),
    t('Relaciones y Citas'),
    'Telegram Bots',
    t('Stickers'),
  ], [t]);

  // Memoizar las expresiones regulares
  const regexPatterns = useMemo(() => ({
    telegram: /^https:\/\/t\.me\/(?:[a-zA-Z0-9_]{5,}|c\/\d+\/\d+|\+[a-zA-Z0-9_-]{10,})$/,
    whatsappGroup: /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]{22}$/,
    whatsappChannel: /^https:\/\/(wa\.me|whatsapp\.com)\/channel\/[a-zA-Z0-9_]{8,}$/,
    email: /^\S+@\S+\.\S+$/,
  }), []);

  const form = useForm({
    initialValues: {
      name: '',
      link: '',
      email: '',
      emailRepeat: '',
      descriptionEs: '',
      descriptionEn: '',
      city: '',
      content18: '',
      categories: [],
      acceptTerms: false,
    },
    validate: {
      email: (v) => (regexPatterns.email.test(v) ? null : t('Email inválido')),
      emailRepeat: (v, vals) => v === vals.email ? null : t('Los emails no coinciden'),
      acceptTerms: (v) => v ? null : t('Debes aceptar los términos'),
      categories: (value) => {
        if (!Array.isArray(value) || value.length < 1) return t('Selecciona al menos una categoría');
        if (value.length > 3) return t('Máximo 3 categorías');
        return null;
      },
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
      name: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return t('El nombre es obligatorio');
        const hasText = /[a-zA-Z0-9]/.test(trimmed);
        if (!hasText) return t('El nombre no puede ser solo emojis');
        return null;
      },
      link: (v) => {
        const val = v.trim();
        if (redSocial === 'Telegram' && !regexPatterns.telegram.test(val)) {
          return t('El enlace de Telegram no es válido');
        }
        if (redSocial === 'Whatsapp') {
          if (regexPatterns.whatsappGroup.test(val) || regexPatterns.whatsappChannel.test(val)) {
            return null;
          }
          return t('El enlace de WhatsApp debe ser un grupo o canal válido');
        }
        return null;
      }
    },
  });

  // Función de traducción optimizada con manejo de errores mejorado
  const translateText = useCallback(async (text, source, target) => {
    const DEEPL_PROXY_URL = 'https://daniel-rdz.tech/translate';
    
    // Cancelar solicitud anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const res = await fetch(DEEPL_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source, target }),
        signal: abortControllerRef.current.signal,
        timeout: 10000, // 10 segundos de timeout
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.translated || '';
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Traducción cancelada');
        return '';
      }
      console.warn('Error de traducción:', error.message);
      return '';
    }
  }, []);

  // Debounced translation con cleanup mejorado
  const debouncedTranslate = useCallback(async () => {
    // Limpiar timeout anterior
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }

    translationTimeoutRef.current = setTimeout(async () => {
      if (isTranslating) return; // Evitar múltiples traducciones simultáneas

      const { descriptionEs, descriptionEn } = form.values;

      try {
        setIsTranslating(true);

        if (baseLang === 'es' && descriptionEs.trim().length >= 20 && !descriptionEn.trim()) {
          const translated = await translateText(descriptionEs, 'ES', 'EN');
          if (translated) {
            form.setFieldValue('descriptionEn', translated);
          }
        }

        if (baseLang === 'en' && descriptionEn.trim().length >= 20 && !descriptionEs.trim()) {
          const translated = await translateText(descriptionEn, 'EN', 'ES');
          if (translated) {
            form.setFieldValue('descriptionEs', translated);
          }
        }
      } catch (error) {
        console.error('Error en traducción automática:', error);
      } finally {
        setIsTranslating(false);
      }
    }, 1000); // Aumentado a 1 segundo para reducir llamadas
  }, [baseLang, form, translateText, isTranslating]);

  // Función de verificación optimizada
  const handleVerify = useCallback(async () => {
    setModalOpen(false);
    setIsLoading(true);

    try {
      const rawLink = form.values.link.trim();
      const cleanLink = rawLink.endsWith('/') ? rawLink.slice(0, -1) : rawLink;

      // Verificaciones en paralelo para mejor rendimiento
      const [existingGroups, slugGroups] = await Promise.all([
        getDocs(query(collection(db, 'groups'), where('link', '==', cleanLink))),
        getDocs(query(collection(db, 'groups'), where('slug', '==', slugify(form.values.name))))
      ]);

      if (!existingGroups.empty) {
        showNotification({
          title: t('Enlace duplicado'),
          message: t('Este grupo ya fue publicado antes 📌'),
          color: 'red',
        });
        return;
      }

      if (!slugGroups.empty) {
        showNotification({
          title: t('Nombre duplicado'),
          message: t('Ya existe un grupo con ese nombre 📌'),
          color: 'red',
        });
        return;
      }

      const slug = slugify(form.values.name);
      const { descriptionEs, descriptionEn, ...cleanValues } = form.values;

      const docRef = await addDoc(collection(db, 'groups'), {
        ...cleanValues,
        tipo: redSocial.toLowerCase(),
        description: {
          es: descriptionEs.trim() || '',
          en: descriptionEn.trim() || '',
        },
        link: cleanLink,
        destacado: false,
        visitas: 0,
        createdAt: new Date(),
        slug,
        translationPending: !descriptionEs.trim() || !descriptionEn.trim(),
      });

      // Traducción post-envío optimizada
      const needsTranslation = !descriptionEs.trim() || !descriptionEn.trim();
      if (needsTranslation) {
        const text = descriptionEs.trim() || descriptionEn.trim();
        const source = descriptionEs.trim() ? 'ES' : 'EN';
        const target = descriptionEs.trim() ? 'EN' : 'ES';

        // Traducción asíncrona sin bloquear la navegación
        translateText(text, source, target)
          .then(async (translated) => {
            if (translated && translated.length >= 20) {
              await updateDoc(docRef, {
                [`description.${target.toLowerCase()}`]: translated,
                translationPending: false,
              });
            }
          })
          .catch(error => console.error('Error en traducción post-envío:', error));
      }

      form.reset();
      const subdomain = form.values.city || 'www';
      window.location.href = `https://${subdomain}.joingroups.pro/comunidades/grupos-de-${redSocial.toLowerCase()}/${slug}`;

    } catch (error) {
      console.error('Error al guardar:', error);
      showNotification({
        title: t('Error'),
        message: t('No se pudo guardar. Intenta nuevamente.'),
        color: 'red',
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, redSocial, t, translateText]);

  // Manejador de cambio de enlace optimizado
  const handleLinkChange = useCallback((event) => {
    const input = event.currentTarget.value;
    const prefix = 'https://t.me/';

    if (redSocial === 'Telegram') {
      const typedPrefix = input.slice(0, prefix.length);
      const rest = input.slice(prefix.length);
      
      if (
        typedPrefix.toLowerCase() !== prefix.toLowerCase() &&
        prefix.toLowerCase().startsWith(typedPrefix.toLowerCase())
      ) {
        form.setFieldValue('link', prefix + rest);
      } else {
        form.setFieldValue('link', input);
      }
    } else {
      form.setFieldValue('link', input);
    }
  }, [redSocial, form]);

  // Manejador de envío del formulario
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const validation = form.validate();
    if (!validation.hasErrors) {
      setModalOpen(true);
    }
  }, [form]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Determinar el estado del enlace de WhatsApp
  const whatsappLinkStatus = useMemo(() => {
    if (redSocial !== 'Whatsapp' || !form.values.link) return null;
    
    const link = form.values.link.trim();
    if (regexPatterns.whatsappGroup.test(link)) {
      return { valid: true, type: 'group' };
    }
    if (regexPatterns.whatsappChannel.test(link)) {
      return { valid: true, type: 'channel' };
    }
    return { valid: false, type: null };
  }, [redSocial, form.values.link, regexPatterns]);

  return (
    <>
      <Helmet>
        <title>Publicar Grupo de Telegram o WhatsApp | Gratis en JoinGroups 2025</title>
        <meta name="description" content="Envía tu grupo o canal de Telegram o WhatsApp para ser listado en el directorio verificado JoinGroups. +18, anime, estudio, tecnología y más. ¡Publicar es gratis y fácil!" />
        <link rel="canonical" href="https://joingroups.pro/form" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Publica tu Grupo en JoinGroups | Gratis, Fácil y Verificado" />
        <meta property="og:description" content="Comparte tu grupo de Telegram o WhatsApp con miles de usuarios. Únete al directorio de comunidades activas. +18, anime, estudio, tecnología y más." />
        <meta property="og:url" content="https://joingroups.pro/form" />
        <meta property="og:image" content="https://joingroups.pro/og-image-formulario.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Publicar Grupo en Telegram o WhatsApp | Gratis en JoinGroups" />
        <meta name="twitter:description" content="Agrega tu grupo a nuestro directorio verificado. Miles de usuarios activos buscan comunidades como la tuya." />
        <meta name="twitter:image" content="https://joingroups.pro/og-image-formulario.jpg" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "¿Es gratis publicar mi grupo en JoinGroups?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sí, la publicación es 100% gratuita. Solo completá el formulario y revisaremos tu grupo."
                  }
                },
                {
                  "@type": "Question",
                  "name": "¿Puedo publicar un grupo con contenido +18?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sí, siempre que esté claramente marcado y cumpla con nuestras reglas. Las categorías NSFW están permitidas."
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>

      <Stack spacing="sm" mb="md">
        <Title order={2}>
          {t('Publica tu Grupo')}
        </Title>

        <Button
          leftSection={<IconBrandWhatsapp size={18} />}
          variant="outline"
          color="blue"
          component="a"
          href="https://wa.me/5212284935831?text=Hola,%20tengo%20un%20problema%20para%20publicar%20mi%20grupo%20en%20JoinGroups"
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
        >
          {t('¿Tienes problemas? Escríbenos por WhatsApp')}
        </Button>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label={t(`Nombre del Grupo de ${redSocial}`)}
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label={t("Enlace de invitación")}
            placeholder={redSocial === 'Telegram' ? 'https://t.me/' : ''}
            required
            value={form.values.link}
            onChange={handleLinkChange}
            error={form.errors.link}
          />

          {whatsappLinkStatus && (
            <Text 
              size="xs" 
              c={whatsappLinkStatus.valid ? 'green' : 'red'}
            >
              {whatsappLinkStatus.valid
                ? whatsappLinkStatus.type === 'group'
                  ? t('Detectado: grupo de WhatsApp')
                  : t('Detectado: canal de WhatsApp')
                : t('Enlace no válido de grupo o canal')
              }
            </Text>
          )}

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
            rightSection={isTranslating ? <Text size="xs">Traduciendo...</Text> : null}
          />

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
            rightSection={isTranslating ? <Text size="xs">Translating...</Text> : null}
          />
          
          <Select
            label={t("Ciudad")}
            placeholder={t("Selecciona una ciudad")}
            data={cities}
            searchable
            required
            nothingFound={t('Ninguna ciudad coincide')}
            {...form.getInputProps('city')}
          />    

          <MultiSelect
            label={t("Categorías")}
            placeholder={t("Selecciona una o varias categorías, Max 3")}
            required
            data={categories}
            searchable
            clearable
            multiple
            {...form.getInputProps('categories')}
          />

          <Checkbox
            label={t("He leído y acepto las condiciones de uso y la privacidad")}
            required
            {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
          />

          <Button 
            type="submit" 
            mt="md" 
            loading={isLoading} 
            loaderProps={{ type: 'dots' }}
            disabled={isTranslating}
          >
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
