// Trampa de foco accesible para modales y drawers.
// Mantiene el foco dentro del contenedor mientras está abierto y lo
// devuelve al elemento que lo abrió al cerrarse.

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(el) {
  if (el.hidden) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;

  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (view && typeof view.getComputedStyle === 'function') {
    const style = view.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}

/** Devuelve los elementos enfocables visibles dentro de un contenedor. */
export function getFocusable(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(isVisible);
}

/**
 * Activa una trampa de foco en `container`.
 * @returns {() => void} Función para liberar la trampa y restaurar el foco.
 */
export function createFocusTrap(container, { initialFocus = null } = {}) {
  if (!container) return () => {};

  const previouslyFocused = document.activeElement;

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    const focusables = getFocusable(container);
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !container.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeydown);

  const target = initialFocus || getFocusable(container)[0];
  if (target && typeof target.focus === 'function') {
    target.focus();
  }

  return function release() {
    container.removeEventListener('keydown', handleKeydown);
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  };
}
