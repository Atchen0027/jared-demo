import { describe, it, expect } from 'vitest';
import {
  itemKey,
  createCartItem,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  calculateTotals,
} from '../src/lib/cart.js';

const product = {
  id: 'jabon-lavanda',
  name: 'Jabón de Lavanda',
  categoryName: 'Jabones',
  image: '/images/products/jabon-lavanda.webp',
};
const variant = { id: 'std', label: 'Estándar', weight: '100g', price: 3.8 };
const otherVariant = { id: 'pack3', label: 'Pack 3', weight: '300g', price: 10 };

describe('createCartItem', () => {
  it('genera un id compuesto y copia los datos de producto/variante', () => {
    const item = createCartItem(product, variant, 2);
    expect(item.cartItemId).toBe('jabon-lavanda__std');
    expect(item.name).toBe('Jabón de Lavanda');
    expect(item.price).toBe(3.8);
    expect(item.quantity).toBe(2);
  });
});

describe('addItemToCart', () => {
  it('añade una línea nueva', () => {
    const cart = addItemToCart([], product, variant, 1);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('incrementa la cantidad si ya existe la misma variante', () => {
    let cart = addItemToCart([], product, variant, 1);
    cart = addItemToCart(cart, product, variant, 2);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(3);
  });

  it('crea líneas separadas para variantes distintas', () => {
    let cart = addItemToCart([], product, variant, 1);
    cart = addItemToCart(cart, product, otherVariant, 1);
    expect(cart).toHaveLength(2);
  });

  it('no muta el carrito original (inmutable)', () => {
    const original = [];
    addItemToCart(original, product, variant, 1);
    expect(original).toHaveLength(0);
  });
});

describe('updateItemQuantity', () => {
  it('suma el delta a la línea indicada', () => {
    let cart = addItemToCart([], product, variant, 1);
    cart = updateItemQuantity(cart, 'jabon-lavanda__std', 2);
    expect(cart[0].quantity).toBe(3);
  });

  it('elimina la línea cuando la cantidad llega a 0', () => {
    let cart = addItemToCart([], product, variant, 1);
    cart = updateItemQuantity(cart, 'jabon-lavanda__std', -1);
    expect(cart).toHaveLength(0);
  });

  it('ignora un id inexistente', () => {
    const cart = addItemToCart([], product, variant, 1);
    expect(updateItemQuantity(cart, 'no-existe', 1)).toEqual(cart);
  });
});

describe('removeItemFromCart', () => {
  it('elimina la línea indicada', () => {
    let cart = addItemToCart([], product, variant, 1);
    cart = addItemToCart(cart, product, otherVariant, 1);
    cart = removeItemFromCart(cart, 'jabon-lavanda__std');
    expect(cart).toHaveLength(1);
    expect(itemKey(cart[0])).toBe('jabon-lavanda__pack3');
  });
});

describe('calculateTotals', () => {
  const shipping = { standardFee: 3.9, freeShippingThreshold: 35 };

  it('calcula subtotal y gastos de envío', () => {
    let cart = addItemToCart([], product, variant, 2); // 7.60
    const totals = calculateTotals(cart, shipping);
    expect(totals.subtotal).toBe(7.6);
    expect(totals.shipping).toBe(3.9);
    expect(totals.finalTotal).toBe(11.5);
    expect(totals.totalItems).toBe(2);
    expect(totals.isFreeShipping).toBe(false);
    expect(totals.missingForFreeShipping).toBe(27.4);
  });

  it('envío gratis al superar el umbral', () => {
    const cart = addItemToCart([], product, otherVariant, 4); // 40
    const totals = calculateTotals(cart, shipping);
    expect(totals.isFreeShipping).toBe(true);
    expect(totals.shipping).toBe(0);
    expect(totals.finalTotal).toBe(40);
    expect(totals.missingForFreeShipping).toBe(0);
  });

  it('carrito vacío no cobra envío', () => {
    const totals = calculateTotals([], shipping);
    expect(totals.subtotal).toBe(0);
    expect(totals.shipping).toBe(0);
    expect(totals.finalTotal).toBe(0);
    expect(totals.totalItems).toBe(0);
  });
});
