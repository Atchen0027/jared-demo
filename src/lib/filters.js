// Lógica pura de filtrado y ordenación del catálogo.

/**
 * Comprueba si un producto (representado por atributos planos) cumple los filtros.
 * @param {{ category: string, price: number, stock: boolean, name: string }} attrs
 * @param {{ category?: string, query?: string, maxPrice?: number, stockOnly?: boolean }} filters
 */
export function matchesFilters(attrs, filters) {
  const { category = 'all', query = '', maxPrice = Infinity, stockOnly = false } = filters;

  const matchCat = category === 'all' || attrs.category === category;
  const matchPrice = attrs.price <= maxPrice;
  const matchStock = !stockOnly || attrs.stock;
  const matchSearch = !query || attrs.name.toLowerCase().includes(query);

  return matchCat && matchPrice && matchStock && matchSearch;
}

/**
 * Comparador para ordenar productos. Reutiliza la misma semántica que el catálogo.
 * @param {{ price: number, name: string, featured: boolean }} a
 * @param {{ price: number, name: string, featured: boolean }} b
 * @param {'featured'|'price-asc'|'price-desc'|'name-asc'} sortBy
 */
export function compareBySort(a, b, sortBy) {
  if (sortBy === 'price-asc') return a.price - b.price;
  if (sortBy === 'price-desc') return b.price - a.price;
  if (sortBy === 'name-asc') return a.name.localeCompare(b.name);

  // 'featured': destacados primero, luego por precio ascendente
  const featA = a.featured ? 1 : 0;
  const featB = b.featured ? 1 : 0;
  if (featB !== featA) return featB - featA;
  return a.price - b.price;
}
