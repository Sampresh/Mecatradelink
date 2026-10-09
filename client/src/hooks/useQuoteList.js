'use client';

import { useSyncExternalStore } from 'react';

// The quote list is a per-browser draft (not server data, not auth), kept in localStorage.
const KEY = 'mtl_quote_list';
const EMPTY = [];
const listeners = new Set();
let cache = null;

function read() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY)) || EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage unavailable (private mode) — keep in memory only
  }
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (e) => { if (e.key === KEY) { cache = null; listener(); } };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(listener); window.removeEventListener('storage', onStorage); };
}

export function useQuoteList() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);

  return {
    items,
    count: items.length,
    has: (id) => items.some((i) => i.id === id),
    add: (product, quantity = 1) => {
      const current = read();
      const existing = current.find((i) => i.id === product.id);
      write(
        existing
          ? current.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i))
          : [...current, { id: product.id, name: product.name, slug: product.slug, unit: product.unit, imageUrl: product.imageUrl, quantity }],
      );
    },
    setQuantity: (id, quantity) => write(read().map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))),
    remove: (id) => write(read().filter((i) => i.id !== id)),
    clear: () => write(EMPTY),
  };
}
