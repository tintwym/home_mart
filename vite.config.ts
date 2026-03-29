// @ts-nocheck
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    resolve: {
        alias:
            process.env.BUILD_PWA === '1'
                ? []
                : [
                      {
                          find: 'virtual:pwa-register',
                          replacement: path.resolve(__dirname, 'resources/js/pwa-register-stub.ts'),
                      },
                  ],
    },
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),

        // PWA conditional logic
        ...(process.env.BUILD_PWA === '1'
            ? [
                  VitePWA({
                      registerType: 'autoUpdate',
                      includeAssets: ['homemart-logo.png', 'apple-touch-icon.png', 'favicon-32.png'],
                      manifest: false,
                      workbox: {
                          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                          sourcemap: false,
                      },
                      devOptions: { enabled: false },
                  }),
              ]
            : []),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});