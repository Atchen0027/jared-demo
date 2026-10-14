import { withBase } from '../utils/assets.js';

export const categories = [
  {
    id: "jabones-artesanales",
    name: "Jabones Artesanales",
    tagline: "Glicerina vegetal & Aceites esenciales",
    subtitle: "Para tu ducha diaria extraordinaria",
    description: "Nuestras barras artesanales de glicerina vegetal pura son elaboradas a mano en Tenerife. Limpian suavemente, hidratan en profundidad y desprenden aromas irresistibles que transforman tu aseo diario en un auténtico momento de nube.",
    features: [
      "Grabados a mano con sellos e ingredientes botánicos visibles",
      "Glicerina vegetal pura que respeta el manto hidrolipídico",
      "Promoción estrella: combina tus 3 variedades favoritas por sólo 10€",
      "8 variedades: Lavanda, Miel-Cúrcuma, Arroz porcelana, Coco, Naranja..."
    ],
    priceNote: "3 por 10€ (o 3,80€ / unidad)",
    badge: "Promoción Especial 3x10€",
    image: withBase("/images/posters/catalogo-jabones-glicerina.webp"),
    secondaryImage: withBase("/images/posters/ducha-3-jabones-10e.webp"),
    ctaText: "Ver Jabones Artesanales"
  },
  {
    id: "jabones-exfoliantes",
    name: "Jabones Exfoliantes Corporales",
    tagline: "Tarros 250g • Manteca de Karité",
    subtitle: "Piel suave, luminosa y renovada",
    description: "Una textura rica y fundente en formato de 250g que combina la glicerina vegetal con manteca pura de karité y exfoliantes botánicos naturales. Elimina células muertas y asperezas sin agredir, dejando la piel aterciopelada y perfumada desde el primer uso.",
    features: [
      "Nueva fórmula mejorada con extra de nutrición e hidratación",
      "Partículas botánicas biodegradables (semillas, avena coloidal, arroz)",
      "Formato generoso de 250g de larga duración",
      "Textura cremosa que no gotea y se emulsiona fácilmente con agua"
    ],
    priceNote: "Tarro 250g por sólo 6,00€",
    badge: "Tarro 250g por sólo 6€",
    image: withBase("/images/posters/exfoliantes-corporales-tarros.webp"),
    ctaText: "Ver Jabones Exfoliantes"
  },
  {
    id: "cremas",
    name: "Cremas & Mantecas Botánicas",
    tagline: "Nutrición Profunda • Aloe de Canarias",
    subtitle: "El cuidado reparador que tu piel merece",
    description: "Fórmulas creadas con ingredientes vivos del archipiélago canario: jugo puro de Aloe Vera biológico, manteca de karité batida al punto de nieve y bálsamos reconfortantes con cera virgen de abejas locales. Nutrición sin sensación pegajosa.",
    features: [
      "Concentrado de Aloe Vera puro de cultivos volcánicos de Tenerife",
      "Mantecas batidas textura chantilly que funden con el calor de la piel",
      "Bálsamos ultra reparadores para zonas agrietadas o resecas",
      "Fórmulas 100% limpias, sin sulfatos, siliconas ni químicos nocivos"
    ],
    priceNote: "Tratamientos botánicos desde 11,00€",
    badge: "100% Natural & Canarias",
    image: withBase("/images/products/crema-karite-vainilla.webp"),
    ctaText: "Ver Cremas y Mantecas"
  }
];
