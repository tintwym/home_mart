import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsNavLinks } from '@/layouts/settings/use-settings-nav-links';
import { useTranslations } from '@/hooks/use-translations';
import { toUrl } from '@/lib/utils';

export function SettingsMobileMenuList() {
    const { t } = useTranslations();
    const links = useSettingsNavLinks();
    const accountLinks = links.slice(0, 4);
    const orderLinks = links.slice(4);

    return (
        <nav className="flex flex-col" aria-label={t('settings.aria')}>
            <div className="px-4 pt-0">
                <p className="text-sm font-medium text-muted-foreground">
                    {t('settings.section_account')}
                </p>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5 px-2">
                {accountLinks.map((item) => (
                    <li key={toUrl(item.href)}>
                        <Button
                            variant="ghost"
                            className="h-auto min-h-11 w-full justify-start px-3 py-2.5 font-normal"
                            asChild
                        >
                            <Link
                                href={item.href}
                                prefetch
                                className="flex w-full items-center gap-3"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <item.icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1 text-left text-sm font-medium">
                                    {item.title}
                                </span>
                                <ChevronRight
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                            </Link>
                        </Button>
                    </li>
                ))}
            </ul>

            <div className="px-4 pt-8">
                <p className="text-sm font-medium text-muted-foreground">
                    {t('settings.section_orders')}
                </p>
            </div>
            <ul className="mt-2 flex flex-col gap-0.5 px-2 pb-2">
                {orderLinks.map((item) => (
                    <li key={toUrl(item.href)}>
                        <Button
                            variant="ghost"
                            className="h-auto min-h-11 w-full justify-start px-3 py-2.5 font-normal"
                            asChild
                        >
                            <Link
                                href={item.href}
                                prefetch
                                className="flex w-full items-center gap-3"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                    <item.icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1 text-left text-sm font-medium">
                                    {item.title}
                                </span>
                                <ChevronRight
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden
                                />
                            </Link>
                        </Button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
