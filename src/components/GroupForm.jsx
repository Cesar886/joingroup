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
  Collapse,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useRef, useState } from 'react';
import slugify from '../assets/slugify'
import { useTranslation } from 'react-i18next';
import { LatencyOptimisedTranslator } from "@browsermt/bergamot-translator/translator.js";



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

      link: (v) =>
        v.startsWith('https://t.me/')
          ? null
          : t('El enlace debe comenzar con https://t.me/'),
    },
  });


  const captchaRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [captchaValues, setCaptchaValues] = useState(null);
  const [activeLang] = useState(baseLang);
  const [translator, setTranslator] = useState(null);
  const [isTranslatorReady, setIsTranslatorReady] = useState(false);
  
  useEffect(() => {
    let translatorInstance = null;
    let cancelled = false;

    async function initTranslator() {
      translatorInstance = new LatencyOptimisedTranslator();

      try {
        await translatorInstance.translate({ from: "en", to: "es", text: "Loading...", html: false });

        if (!cancelled) {
          setTranslator(translatorInstance);
          setIsTranslatorReady(true);
        } else {
          // Cleanup si se canceló antes de estar listo
          translatorInstance.delete();
        }
      } catch (e) {
        console.warn("❌ Error al cargar el traductor:", e.message);
      }
    }

    initTranslator();

    return () => {
      cancelled = true;
    };
  }, []);



  
  async function translateText(text, source, target) {
    if (!translator || !isTranslatorReady) {
      console.warn('Traductor aún no está listo o fue eliminado');
      return '';
    }

    try {
      const result = await translator.translate({
        from: source,
        to: target,
        text,
        html: false,
      });

      return result?.target?.text || '';
    } catch (e) {
      console.warn('❌ Traducción offline falló:', e.message);
      return '';
    }
  }



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
      const rawLink = form.values.link.trim().toLowerCase();
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
      navigate(`/grupo/${slug}`);

      // 👇 Traducción automática post-envío
      if (!descEs || !descEn) {
        const text = descEs || descEn;
        const source = descEs ? 'es' : 'en';
        const target = descEs ? 'en' : 'es';

      let attempts = 0;
      const maxAttempts = 20;
      const retryDelayMs = 3000;

      async function tryTranslationLoop() {
        while (attempts < maxAttempts) {
          attempts++;

          if (!translator || !isTranslatorReady) {
            console.warn(`⏳ Traductor aún no está listo (intento ${attempts})`);
            await new Promise((res) => setTimeout(res, retryDelayMs));
            continue;
          }

          try {
            const translated = await translateText(text, source, target);

            if (translated && translated.length >= 20) {
              await updateDoc(docRef, {
                [`description.${target.toLowerCase()}`]: translated,
                translationPending: false,
              });
              console.log(`✅ Traducción completada en intento ${attempts}`);
              break;
            } else {
              console.warn(`⚠ Traducción vacía o corta (intento ${attempts})`);
            }
          } catch (e) {
            console.error(`❌ Fallo en intento ${attempts}:`, e.message);
          }

          await new Promise((res) => setTimeout(res, retryDelayMs));
        }

        if (attempts >= maxAttempts) {
          console.warn('⛔ Traducción automática fallida después de 20 intentos');
        }
      }

      tryTranslationLoop();

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



  function useDebouncedCallback(callback, delay = 800) {
    const timeout = useRef(null);

    return (...args) => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => callback(...args), delay);
    };
  }
  

  const debouncedTranslate = useDebouncedCallback(async () => {
    const { descriptionEs, descriptionEn } = form.values;

    if (baseLang === 'es' && descriptionEs.trim().length >= 20 && !descriptionEn.trim()) {
      const translated = await translateText(descriptionEs, 'es', 'en');
      if (translated) form.setFieldValue('descriptionEn', translated);
    }

    if (baseLang === 'en' && descriptionEn.trim().length >= 20 && !descriptionEs.trim()) {
      const translated = await translateText(descriptionEn, 'en', 'es');
      if (translated) form.setFieldValue('descriptionEs', translated);
    }
  }, 900);
         // 900 ms tras la última tecla



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
            label={t("Nombre del Grupo de Telegram")}
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label={t("Enlace de invitación")}
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

          {/* Español visible solo si UI en español */}
          <Collapse in={baseLang === 'es'}>
            <Textarea
              label="Descripción (Español)"
              placeholder="⌨ Máximo 320 caracteres"
              required={baseLang === 'es'}
              autosize
              minRows={3}
              value={form.values.descriptionEs}
              onChange={(e) => {
                form.setFieldValue('descriptionEs', e.currentTarget.value);
                debouncedTranslate();
              }}
              error={form.errors.descriptionEs}
              mt="sm"
            />
          </Collapse>

          {/* Inglés visible solo si UI en inglés */}
          <Collapse in={baseLang === 'en'}>
            <Textarea
              label="Description (English)"
              placeholder="⌨ Maximum 320 characters"
              required={baseLang === 'en'}
              autosize
              minRows={3}
              value={form.values.descriptionEn}
              onChange={(e) => {
                form.setFieldValue('descriptionEn', e.currentTarget.value);
                debouncedTranslate();
              }}
              error={form.errors.descriptionEn}
              mt="sm"
            />
          </Collapse>


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
              'XXX',
              'Hacking',
              t('Memes y Humor'),
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

          <Button type="submit" mt="md" loading={isLoading}>
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