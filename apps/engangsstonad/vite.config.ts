/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react({
            include: '**/*.{jsx,tsx}',
        }),
        {
            name: 'crossorigin',
            transformIndexHtml(html) {
                return html.replace(/<link rel="stylesheet" crossorigin/g, '<link rel="stylesheet" type="text/css"');
            },
        },
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
            },
        },
    },
    base: '/engangsstonad/soknad',
    build: {
        sourcemap: true,
    },
    resolve: {
        alias: {
            styles: path.resolve(__dirname, './src/styles'),
            types: path.resolve(__dirname, './src/types/'),
            appData: path.resolve(__dirname, './src/app-data/'),
        },
    },
    server: {
        // Whitelist dev.nav.no for bruk med "vite-mode"
        cors: {
            origin: ['https://www.intern.dev.nav.no', new RegExp('^http://localhost:')],
        },
        port: 8080,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest/setupTests.ts',
        coverage: {
            include: ['src/**/*'],
            exclude: [],
        },
        testTimeout: 10000,
    },
});
