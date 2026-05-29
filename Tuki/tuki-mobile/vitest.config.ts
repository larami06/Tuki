import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/services/**', 'src/tests/logic/**'],
    },
  },
  resolve: {
    alias: {
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/tests/mocks/async-storage.ts'
      ),
      'expo-constants': path.resolve(__dirname, 'src/tests/mocks/expo-constants.ts'),
    },
  },
});
