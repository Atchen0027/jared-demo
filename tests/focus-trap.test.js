import { describe, it, expect, beforeEach } from 'vitest';
import { createFocusTrap, getFocusable } from '../src/lib/focus-trap.js';

function buildModal() {
  document.body.innerHTML = `
    <button id="trigger">Abrir</button>
    <div id="modal">
      <button id="first">Primero</button>
      <a href="#" id="link">Enlace</a>
      <button id="last">Último</button>
      <button id="hidden" hidden>Oculto</button>
    </div>`;
  return document.getElementById('modal');
}

describe('getFocusable', () => {
  it('lista los elementos enfocables y omite los ocultos', () => {
    const modal = buildModal();
    const ids = getFocusable(modal).map((el) => el.id);
    expect(ids).toEqual(['first', 'link', 'last']);
  });
});

describe('createFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('enfoca el primer elemento al activarse', () => {
    const modal = buildModal();
    createFocusTrap(modal);
    expect(document.activeElement.id).toBe('first');
  });

  it('respeta initialFocus', () => {
    const modal = buildModal();
    createFocusTrap(modal, { initialFocus: document.getElementById('last') });
    expect(document.activeElement.id).toBe('last');
  });

  it('cicla de último a primero con Tab', () => {
    const modal = buildModal();
    createFocusTrap(modal);
    document.getElementById('last').focus();

    const event = new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.getElementById('last').dispatchEvent(event);

    expect(document.activeElement.id).toBe('first');
  });

  it('cicla de primero a último con Shift+Tab', () => {
    const modal = buildModal();
    createFocusTrap(modal);
    document.getElementById('first').focus();

    const event = new window.KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });
    document.getElementById('first').dispatchEvent(event);

    expect(document.activeElement.id).toBe('last');
  });

  it('restaura el foco del disparador al liberar', () => {
    const modal = buildModal();
    const trigger = document.getElementById('trigger');
    trigger.focus();

    const release = createFocusTrap(modal);
    expect(document.activeElement.id).toBe('first');

    release();
    expect(document.activeElement.id).toBe('trigger');
  });
});
