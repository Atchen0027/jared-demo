// Lógica pura del carrito (sin DOM), fácil de testear.
import { roundMoney } from './money.js';

/** Identificador estable de una línea del carrito. */
export function itemKey(item) {
  return item.cartItemId || item.id;
}

/** Construye una línea de carrito a partir de un producto y su variante. */
export function createCartItem(product, variant, quantity) {
  const cartItemId = `${product.id}__${variant.id}`;
  return {
    id: cartItemId,
    cartItemId,
    productId: product.id,
    name: product.name,
    variantId: variant.id,
    variantName: variant.label,
    weight: variant.weight,
    price: variant.price,
    image: product.image,
    categoryName: product.categoryName,
    quantity,
  };
}

/**
 * Añade un producto al carrito (inmutable). Si la variante ya existe,
 * incrementa su cantidad; si no, añade una nueva línea.
 */
export function addItemToCart(cart, product, variant, qty = 1) {
  const key = `${product.id}__${variant.id}`;
  const exists = cart.some((item) => itemKey(item) === key);

  if (exists) {
    return cart.map((item) =>
      itemKey(item) === key ? { ...item, quantity: item.quantity + qty } : item
    );
  }
  return [...cart, createCartItem(product, variant, qty)];
}

/** Incrementa/decrementa la cantidad de una línea y elimina si llega a 0. */
export function updateItemQuantity(cart, itemId, delta) {
  const index = cart.findIndex((item) => itemKey(item) === itemId);
  if (index === -1) return cart;

  return cart
    .map((item, i) => (i === index ? { ...item, quantity: item.quantity + delta } : item))
    .filter((item) => item.quantity > 0);
}

/** Elimina una línea del carrito. */
export function removeItemFromCart(cart, itemId) {
  return cart.filter((item) => itemKey(item) !== itemId);
}

/**
 * Calcula subtotal, envío y total a partir del carrito y la config de envíos.
 * @param {Array} cart
 * @param {{ standardFee: number, freeShippingThreshold: number }} shippingConfig
 */
export function calculateTotals(cart, shippingConfig) {
  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    subtotal += item.price * item.quantity;
    totalItems += item.quantity;
  });

  subtotal = roundMoney(subtotal);

  const freeThreshold = shippingConfig.freeShippingThreshold;
  const isFreeShipping = subtotal >= freeThreshold;
  const shipping = subtotal > 0 ? (isFreeShipping ? 0 : shippingConfig.standardFee) : 0;
  const finalTotal = roundMoney(subtotal + shipping);

  return {
    subtotal,
    shipping,
    isFreeShipping,
    finalTotal,
    totalItems,
    missingForFreeShipping: Math.max(0, roundMoney(freeThreshold - subtotal)),
  };
}
