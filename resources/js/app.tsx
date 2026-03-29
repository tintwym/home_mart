import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Home Mart';

// Register service worker for PWA when built with PWA plugin (BUILD_PWA=1)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    import('virtual:pwa-register')
        .then(({ registerSW }) => registerSW({ immediate: true }))
        .catch(() => {});
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
                <SpeedInsights />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
