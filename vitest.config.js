import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['engine/**/*.{test,spec}.{js,ts}', 'port/**/*.{test,spec}.{js,ts}'],
        exclude: ['**/node_modules/**', '**/dist/**', 'src/**'],
    },
});
