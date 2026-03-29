import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useSettingsNavLinks } from '@/layouts/settings/use-settings-nav-links';
import { useTranslations } from '@/hooks/use-translations';
import { cn, toUrl } from '@/lib/utils';
import { index as settingsIndex } from '@/routes/settings';

type SettingsLayoutProps = PropsWithChildren<{
    /** Title in the mobile top bar (back goes to the settings hub). */
    mobilePageTitle: string;
}>;

export default function SettingsLayout({
    children,
    mobilePageTitle,
}: SettingsLayoutProps) {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslations();
    const navLinks = useSettingsNavLinks();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 pt-1 pb-6 max-lg:-mt-1 lg:mt-0 lg:py-6">
            <div className="hidden lg:block">
                <Heading
                    title={t('settings.title')}
                    description={t('settings.description')}
                />
            </div>

            <header className="mb-4 flex items-center gap-1 lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    asChild
                >
                    <Link
                        href={settingsIndex()}
                        prefetch
                        className="inline-flex size-10 items-center justify-center"
                        aria-label={t('settings.back_to_settings_menu')}
                    >
                        <ChevronLeft className="size-5" />
                    </Link>
                </Button>
                <h2 className="text-lg font-semibold tracking-tight">
                    {mobilePageTitle}
                </h2>
            </header>

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="hidden w-full max-w-xl lg:block lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label={t('settings.aria')}
                    >
                        {navLinks.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'h-auto min-h-9 w-full justify-start py-2',
                                    {
                                        'bg-muted': isCurrentUrl(item.href),
                                    },
                                )}
                            >
                                <Link href={item.href} prefetch>
                                    <span className="me-2 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                        <item.icon className="size-4" />
                                    </span>
                                    <span>{item.title}</span>
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
