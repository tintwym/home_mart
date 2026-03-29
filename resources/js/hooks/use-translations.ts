import { usePage } from '@inertiajs/react';

type Translations = Record<string, string>;

export function useTranslations() {
    const page = usePage();
    const translations: Translations =
        (page.props.translations as Translations) ?? {};
    const locale = (page.props.locale as string) ?? 'en';

    function t(key: string, params?: Record<string, string | number>): string {
        let value = translations[key] ?? key;
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                value = value.replace(new RegExp(`:${k}`, 'g'), String(v));
            }
        }
        return value;
    }

    /** Translated category name by slug; falls back to DB name if no key. */
    function categoryName(cat: { name: string; slug: string }): string {
        const key = 'category.' + cat.slug;
        return translations[key] ?? cat.name;
    }

    return { t, categoryName, locale, translations };
}
