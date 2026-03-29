/// <reference types="vite/client" />

declare module 'virtual:pwa-register' {
    export function registerSW(options?: {
        immediate?: boolean;
    }): Promise<void>;
}

// Wayfinder-generated action modules (resolved at build time by Vite)
declare module '@/actions/App/Http/Controllers/Settings/PasswordController';
declare module '@/actions/App/Http/Controllers/Settings/ProfileController';
declare module '@/actions/App/Http/Controllers/Settings/TwoFactorAuthenticationController';
declare module '@/actions/Laravel/Fortify/Http/Controllers/RecoveryCodeController';
declare module '@/actions/Laravel/Fortify/Http/Controllers/TwoFactorQrCodeController';
declare module '@/actions/Laravel/Fortify/Http/Controllers/TwoFactorSecretKeyController';
declare module '@/actions/Laravel/Fortify/Http/Controllers/TwoFactorAuthenticationController';
declare module '@/actions/Laravel/Fortify/Http/Controllers/ConfirmedTwoFactorAuthenticationController';
