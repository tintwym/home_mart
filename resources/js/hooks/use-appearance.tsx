import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';

export type UseAppearanceReturn = {
    readonly resolvedAppearance: ResolvedAppearance;
};

const listeners = new Set<() => void>();

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (): void => {
    if (typeof document === 'undefined') return;

    const isDark = prefersDark();

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined') return null;

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (): void => {
    applyTheme();
    notify();
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') return;

    applyTheme();

    // React to system theme changes
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance(): UseAppearanceReturn {
    const resolvedAppearance: ResolvedAppearance = useSyncExternalStore(
        subscribe,
        () => (prefersDark() ? 'dark' : 'light'),
        () => 'light',
    );

    return { resolvedAppearance } as const;
}
