// Helper para resolver rutas de assets relativas al BASE_URL de Astro (útil para GitHub Pages)
export const baseUrl = (import.meta.env?.BASE_URL || '/').replace(/\/$/, '');

export function withBase(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
