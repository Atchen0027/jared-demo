// Utilidades monetarias puras y testeables.

/** Redondea un importe a 2 decimales (redondeo monetario seguro). */
export function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

/** Formatea un importe en euros con coma decimal: 3.8 -> "3,80€". */
export function formatPrice(value) {
  return `${Number(value).toFixed(2).replace('.', ',')}€`;
}
