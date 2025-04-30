import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import laravel from 'laravel-vite-plugin';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
    plugins: [
        svelte(),
        svelteTesting(),
        laravel({
            input: ['src/main.ts'],
            refresh: true
        })
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/tests/setup.ts',
        include: ['src/**/*.{test,spec}.{js,ts}']
    },
    build: {
        chunkSizeWarningLimit: 1000
    }
});
