import { vi } from 'vitest';

const store: Record<string, string> = {};

const AsyncStorage = {
  getItem: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
    return Promise.resolve();
  }),
  clear: vi.fn(() => {
    Object.keys(store).forEach(k => delete store[k]);
    return Promise.resolve();
  }),
  __store: store,
};

export default AsyncStorage;
