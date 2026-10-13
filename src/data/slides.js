import { withBase } from '../utils/assets.js';

export const slides = [
  {
    id: "slide-1",
    tagline: "Cosmética Natural • Islas Canarias",
    title: "Tu piel merece un descanso en las nubes",
    description: "Jabones de glicerina vegetal hechos a mano en Tenerife. Ingredientes 100% naturales, perfumes irresistibles y cuidado consciente.",
    ctaText: "Descubrir Colección",
    ctaLink: "#catalogo",
    filterCategory: "all",
    badge: "Promoción Especial 3 x 10€",
    image: withBase("/images/hero/hero-spa-artesanal.jpg"),
    alt: "Bodegón spa artesanal con jabones de glicerina Nubeterapia"
  },
  {
    id: "slide-2",
    tagline: "Regalo Especial Artesanal",
    title: "Cajita de Regalo con 8 Jabones a Elegir",
    description: "Caja de regalo exclusiva con virutas de relleno natural, lazo satinado y tus 8 variedades de glicerina favoritas por solo 30€.",
    ctaText: "Ver Cajita Especial",
    ctaLink: "#catalogo",
    filterCategory: "jabones-artesanales",
    badge: "Solo 30€ • Edición Especial",
    image: withBase("/images/posters/caja-regalo-8-jabones.jpg"),
    alt: "Caja de regalo Nubeterapia con 8 jabones de glicerina"
  },
  {
    id: "slide-3",
    tagline: "Nueva Fórmula Mejorada 250g",
    title: "Exfoliantes Corporales con Karité y Glicerina",
    description: "Renueva tu piel con texturas cremosas enriquecidas con manteca de karité pura y partículas botánicas naturales. Piel suave desde el primer uso.",
    ctaText: "Explorar Exfoliantes",
    ctaLink: "#catalogo",
    filterCategory: "jabones-exfoliantes",
    badge: "Por sólo 6€ el tarro",
    image: withBase("/images/posters/exfoliantes-corporales-tarros.jpg"),
    alt: "Colección de exfoliantes corporales artesanales en tarro"
  },
  {
    id: "slide-4",
    tagline: "Edición Limitada Verano XXL",
    title: "Jabón Masajeador de Mango & Semillas de Amapola",
    description: "Formato XXL con nódulos masajeadores que activan la circulación, exfolian suavemente y desprenden un dulce aroma tropical.",
    ctaText: "Ver Jabón Masajeador",
    ctaLink: "#catalogo",
    filterCategory: "jabones-artesanales",
    badge: "Pack 2 unidades por 10€",
    image: withBase("/images/posters/jabon-masajeador-mango-xxl.jpg"),
    alt: "Jabón masajeador XXL de mango con semillas de amapola"
  }
];
