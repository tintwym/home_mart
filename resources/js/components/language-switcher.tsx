import { router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/use-translations';

const LOCALES: { code: string; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'my', label: 'မြန်မာ' },
];

export function LanguageSwitcher() {
    const { t, locale } = useTranslations();

    function setLocale(code: string) {
        router.post('/locale', { locale: code }, { preserveScroll: true });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex h-9 w-9 shrink-0"
                    aria-label={t('nav.language')}
                >
                    <Languages className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {LOCALES.map(({ code, label }) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => setLocale(code)}
                        className={locale === code ? 'bg-accent' : ''}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
