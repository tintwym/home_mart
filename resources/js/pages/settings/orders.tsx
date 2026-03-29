import { Head, Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import Heading from '@/components/heading';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { index as settingsIndex } from '@/routes/settings';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type OrderItem = {
    id: string;
    listing_id: string;
    quantity: number;
    price: number;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        image_url?: string | null;
        price: number;
        user?: { id: string; region?: string | null } | null;
    };
};

type Order = {
    id: string;
    status: string;
    total: number;
    created_at: string;
    items: OrderItem[];
};

type Props = {
    orders?: Order[];
};

export default function Orders({ orders = [] }: Props) {
    const { t } = useTranslations();
    const { formatPrice } = useCurrency();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('orders.breadcrumb_settings'),
            href: settingsIndex.url(),
        },
        { title: t('orders.page_title'), href: '/settings/orders' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('orders.page_title')} />

            <h1 className="sr-only">{t('orders.page_title')}</h1>

            <SettingsLayout mobilePageTitle={t('orders.page_title')}>
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Package className="mb-4 size-16 text-muted-foreground" />
                        <Heading
                            variant="small"
                            title={t('orders.no_orders')}
                            description={t('orders.no_orders_description')}
                        />
                        <Link
                            href={dashboard().url}
                            className="mt-6 inline-block font-medium text-primary hover:underline"
                        >
                            {t('orders.browse_listings')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="rounded-lg border border-border bg-card p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="font-medium">
                                        {t('orders.order_id')}
                                        {order.id.slice(-8)}
                                    </span>
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                                        {order.status}
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                    {order.items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-3"
                                        >
                                            {(item.listing.image_url ??
                                            item.listing.image_path) ? (
                                                <img
                                                    src={
                                                        item.listing
                                                            .image_url ??
                                                        item.listing
                                                            .image_path ??
                                                        ''
                                                    }
                                                    alt=""
                                                    className="size-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="flex size-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                                                    —
                                                </div>
                                            )}
                                            <Link
                                                href={`/listings/${item.listing.id}`}
                                                className="min-w-0 flex-1 truncate text-sm hover:underline"
                                            >
                                                {item.listing.title}
                                            </Link>
                                            <span className="text-sm font-medium">
                                                {formatPrice(
                                                    item.price,
                                                    item.listing?.user?.region,
                                                )}{' '}
                                                × {item.quantity}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 border-t border-border pt-4 font-semibold">
                                    {t('orders.total')}:{' '}
                                    {formatPrice(order.total)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </SettingsLayout>
        </AppLayout>
    );
}
