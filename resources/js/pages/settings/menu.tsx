import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { SettingsMobileMenuList } from '@/components/settings/settings-mobile-menu-list';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { index as settingsIndex } from '@/routes/settings';
import { dashboard } from '@/routes';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem } from '@/types';

const LG_MIN_WIDTH = 1024;

export default function SettingsMenu() {
    const { t } = useTranslations();

    useLayoutEffect(() => {
        const mq = window.matchMedia(`(min-width: ${LG_MIN_WIDTH}px)`);
        const go = () => {
            if (mq.matches) {
                router.visit(edit().url, { replace: true });
            }
        };
        go();
        mq.addEventListener('change', go);
        return () => mq.removeEventListener('change', go);
    }, []);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.title'),
            href: settingsIndex.url(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.title')} />

            <h1 className="sr-only">{t('settings.title')}</h1>

            <div className="max-lg:block lg:hidden">
                <div className="px-0 pt-0 pb-8">
                    <header className="-mx-3 mb-2 flex items-center gap-1 border-b border-border px-1 pb-3 sm:-mx-6 sm:px-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            asChild
                        >
                            <Link
                                href={dashboard()}
                                className="inline-flex size-10 items-center justify-center"
                                aria-label={t('settings.back_to_app')}
                            >
                                <ChevronLeft className="size-5" />
                            </Link>
                        </Button>
                        <h2 className="text-xl font-semibold tracking-tight">
                            {t('settings.title')}
                        </h2>
                    </header>

                    <p className="mb-3 px-1 text-sm text-muted-foreground">
                        {t('settings.description')}
                    </p>

                    <SettingsMobileMenuList />
                </div>
            </div>
        </AppLayout>
    );
}
