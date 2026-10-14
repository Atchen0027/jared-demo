// Acceso seguro a localStorage (evita errores en modo privado / SSR).
export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('No se pudo guardar en almacenamiento local', e);
    return false;
  }
}
