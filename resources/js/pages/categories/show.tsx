import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import type { ListingCardListing } from '@/components/listing-card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Category = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    category: Category;
    listings: ListingCardListing[];
};

export default function CategoryShow({ category, listings = [] }: Props) {
    const { t, categoryName } = useTranslations();
    const name = categoryName(category);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: dashboard().url },
        { title: name, href: `/categories/${category.slug}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={name} />
            <div className="relative flex min-w-0 flex-1 flex-col gap-6">
                <div className="flex items-center gap-3 sm:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation justify-start"
                        asChild
                    >
                        <Link
                            href={dashboard().url}
                            className="inline-flex"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">{name}</h1>
                </div>

                <section aria-label="Listings">
                    <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.length === 0 ? (
                            <p className="col-span-full text-center text-muted-foreground">
                                No listings in this category yet.
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
            </div>
        </AppLayout>
    );
}
