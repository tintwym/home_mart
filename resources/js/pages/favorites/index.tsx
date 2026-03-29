import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Heart } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import type { ListingCardListing } from '@/components/listing-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type Props = {
    listings: ListingCardListing[];
};

export default function FavoritesIndex({ listings = [] }: Props) {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Favorites" />
            <div className="mx-auto w-full max-w-6xl px-0 pb-24 sm:px-2">
                <Link
                    href={dashboard().url}
                    className="mb-4 -ml-1 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Link>
                <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
                    <Heart className="size-6 fill-red-500 text-red-500" />
                    Favorites
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    {listings.length} {listings.length === 1 ? 'item' : 'items'}{' '}
                    saved
                </p>
                <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {listings.length === 0 ? (
                        <p className="col-span-full text-muted-foreground">
                            No favorites yet. Browse listings and tap the heart
                            to save.
                        </p>
                    ) : (
                        listings.map((l) => (
                            <ListingCard key={l.id} listing={l} />
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
