import { usePage } from '@inertiajs/react';
import type { SharedCurrency, SharedData } from '@/types';

const defaultCurrency: SharedCurrency = {
    code: 'USD',
    symbol: '$',
    decimals: 2,
};

export function useCurrency() {
    const page = usePage<SharedData>();
    const currency: SharedCurrency =
        (page.props.currency as SharedCurrency | undefined) ?? defaultCurrency;
    const currencies =
        (page.props.currencies as Record<string, SharedCurrency> | undefined) ??
        {};

    /**
     * Format price. Use sellerRegion when displaying a listing/seller price so
     * Singapore seller shows SGD, etc. Omit for viewer-scoped amounts (e.g. slot/trend labels).
     */
    function formatPrice(
        amount: number | string,
        sellerRegion?: string | null,
    ): string {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (Number.isNaN(num)) {
            const c =
                sellerRegion && currencies[sellerRegion]
                    ? currencies[sellerRegion]!
                    : currency;
            return `${c.symbol}0`;
        }
        const c =
            sellerRegion && currencies[sellerRegion]
                ? currencies[sellerRegion]!
                : currency;
        const decimals = c.decimals ?? 2;
        const formatted = num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
        return `${c.symbol}${formatted}`;
    }

    return { currency, currencies, formatPrice };
}
