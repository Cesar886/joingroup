// utils/slugify.js
export default function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')                    // quita tildes
    .replace(/[\u0300-\u036f]/g, '')    // quita acentos
    .replace(/[^a-z0-9]+/g, '-')        // reemplaza símbolos, espacios y emojis por "-"
    .replace(/^-+|-+$/g, '')            // quita guiones al inicio y final
    .slice(0, 60);                      // limita la longitud
}
