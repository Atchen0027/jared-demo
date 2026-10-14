// Capa de movimiento con GSAP + ScrollTrigger.
// Todas las funciones degradan con elegancia: sin JS o con movimiento
// reducido, el contenido permanece visible y sin animaciones.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Grupos de contenido estático que se revelan en cascada al hacer scroll.
const REVEAL_GROUPS = [
  { selector: '.section-header', stagger: 0 },
  { selector: '.deck-header-text', stagger: 0 },
  { selector: '.events-heading', stagger: 0 },
  { selector: '.about-heading', stagger: 0 },
  { selector: '.about-tag-wrap', stagger: 0 },
  { selector: '.testimonials-header', stagger: 0 },
  { selector: '.benefit-item', stagger: 0.1 },
  { selector: '.feature-card', stagger: 0.1 },
  { selector: '.testimonial-card', stagger: 0.08 },
];

export function initMotion() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;

  REVEAL_GROUPS.forEach(({ selector, stagger }) => {
    const items = gsap.utils.toArray(selector);
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger,
          overwrite: true,
        }),
    });
  });

  initParallax();

  // Recalcular posiciones tras cargar fuentes e imágenes (evita saltos).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

  // Red de seguridad: si algún elemento visible sigue oculto (p. ej. tras un
  // fallo de medición), lo revelamos igualmente.
  const allItems = gsap.utils.toArray(REVEAL_GROUPS.map((g) => g.selector).join(','));
  window.setTimeout(() => {
    allItems.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
      if (inView && Number(gsap.getProperty(el, 'opacity')) < 0.05) {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
      }
    });
  }, 4000);
}

function initParallax() {
  gsap.utils.toArray('[data-parallax], .about-visual-col').forEach((el) => {
    const amount = parseFloat(el.getAttribute('data-parallax')) || 6;
    gsap.fromTo(
      el,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6,
        },
      }
    );
  });
}

/** Animación de entrada para rejillas (catálogo) que se re-renderizan. */
export function animateGridIn(elements, { stagger = 0.04, y = 18 } = {}) {
  if (typeof window === 'undefined') return;
  const items = gsap.utils.toArray(elements);
  if (!items.length) return;

  if (prefersReducedMotion()) {
    gsap.set(items, { clearProps: 'all' });
    return;
  }

  gsap.fromTo(
    items,
    { opacity: 0, y, scale: 0.985 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      ease: 'power2.out',
      stagger,
      overwrite: true,
      clearProps: 'transform,opacity',
    }
  );
}

/** Vuela la imagen del producto hasta el carrito. */
export function flyToCart({ originEl, imageUrl, targetEl }) {
  if (typeof window === 'undefined' || !targetEl || prefersReducedMotion()) return;

  const source = originEl || targetEl;
  const startRect = source.getBoundingClientRect();
  const endRect = targetEl.getBoundingClientRect();
  if (!startRect.width || !endRect.width) return;

  const size = 64;
  const startX = startRect.left + startRect.width / 2 - size / 2;
  const startY = startRect.top + startRect.height / 2 - size / 2;
  const endX = endRect.left + endRect.width / 2 - size / 2;
  const endY = endRect.top + endRect.height / 2 - size / 2;

  const clone = document.createElement('img');
  clone.src = imageUrl || '';
  clone.alt = '';
  clone.setAttribute('aria-hidden', 'true');
  clone.className = 'fly-to-cart-clone';
  clone.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;width:${size}px;height:${size}px;`;
  document.body.appendChild(clone);

  gsap.to(clone, {
    duration: 0.85,
    ease: 'power2.inOut',
    x: endX - startX,
    y: endY - startY,
    scale: 0.2,
    opacity: 0.35,
    onComplete: () => clone.remove(),
  });
}

/** Pequeño rebote (badge del carrito, iconos, etc.). */
export function bump(targetEl) {
  if (typeof window === 'undefined' || !targetEl || prefersReducedMotion()) return;
  gsap.fromTo(
    targetEl,
    { scale: 1 },
    { scale: 1.4, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'scale' }
  );
}
