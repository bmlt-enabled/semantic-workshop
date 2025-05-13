import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// @ts-expect-error set from backend
global.settings = {
  apiBaseUrl: 'https://myzone.org/main_server/'
};

global.window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));
