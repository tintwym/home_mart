import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { AdSlot } from '@/components/ad-slot';
import { ListingCard } from '@/components/listing-card';
import type { ListingCardListing } from '@/components/listing-card';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// Set to true when carousel is ready to enable
const CAROUSEL_ENABLED = false;

type Props = {
    listings: ListingCardListing[];
};

export default function Dashboard({ listings = [] }: Props) {
    const { t } = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: dashboard().url,
        },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />
            <div className="relative flex min-w-0 flex-1 flex-col gap-6 sm:gap-8">
                {/* First row: Carousel (disabled for now) */}
                {CAROUSEL_ENABLED && (
                    <section aria-label="Carousel" className="w-full">
                        <div className="grid gap-4 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 bg-muted/30 dark:border-sidebar-border"
                                />
                            ))}
                        </div>
                    </section>
                )}

                <AdSlot
                    slotId="dashboard-above-listings"
                    size="banner"
                    className="mb-4 sm:mb-6"
                />

                {/* Product listing grid - Carousell style */}
                <section aria-label="Listings" className="w-full">
                    <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.length === 0 ? (
                            <p className="col-span-full text-center text-muted-foreground">
                                {t('dashboard.no_listings')}
                            </p>
                        ) : (
                            listings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                />
                            ))
                        )}
                    </div>
                </section>

                {/* Add product FAB - safe area for mobile notches/home indicator */}
                <Link
                    href="/listings/create"
                    aria-label={t('dashboard.add_product')}
                    className={cn(
                        'fixed z-40 flex size-12 min-h-[48px] min-w-[48px] touch-manipulation items-center justify-center rounded-full',
                        'bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                        'right-[max(1.5rem,env(safe-area-inset-right))] bottom-[max(1.5rem,env(safe-area-inset-bottom))]',
                    )}
                >
                    <Plus className="size-5" />
                </Link>
            </div>
        </AppLayout>
    );
}
