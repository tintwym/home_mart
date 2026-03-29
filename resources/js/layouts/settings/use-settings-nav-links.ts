import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { CreditCard, Key, Package, Shield, User } from 'lucide-react';
import AppTwoFactorController from '@/actions/App/Http/Controllers/Settings/TwoFactorAuthenticationController';
import { useTranslations } from '@/hooks/use-translations';
import { edit } from '@/routes/profile';
import { edit as editPassword } from '@/routes/user-password';

export type SettingsNavLink = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon: LucideIcon;
};

export function useSettingsNavLinks(): SettingsNavLink[] {
    const { t } = useTranslations();

    return [
        {
            title: t('settings.profile'),
            href: edit(),
            icon: User,
        },
        {
            title: t('settings.password'),
            href: editPassword(),
            icon: Key,
        },
        {
            title: t('settings.payment'),
            href: '/settings/payment',
            icon: CreditCard,
        },
        {
            title: t('settings.two_factor'),
            href: AppTwoFactorController.show.url(),
            icon: Shield,
        },
        {
            title: t('settings.orders'),
            href: '/settings/orders',
            icon: Package,
        },
    ];
}
