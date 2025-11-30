import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
  },
  resolve: {
    alias: {
      'chrome-extension://mock-id': resolve(__dirname, 'extension'),
    },
  },
});
