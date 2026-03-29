import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import type { ListingCardListing } from '@/components/listing-card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type User = {
    id: string;
    name: string;
    seller_type?: string;
};

type Props = {
    user: User;
    listings: ListingCardListing[];
    averageRating: number;
    reviewCount: number;
};

export default function UserShow({
    user,
    listings,
    averageRating,
    reviewCount,
}: Props) {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={user.name} />
            <div className="mx-auto w-full max-w-6xl px-0 pb-24 sm:px-2">
                <Link
                    href={dashboard().url}
                    className="mb-4 -ml-1 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back
                </Link>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {user.seller_type === 'business'
                            ? 'Business seller'
                            : 'Individual seller'}
                    </p>
                    {reviewCount > 0 && (
                        <p className="mt-1 text-sm">
                            {averageRating.toFixed(1)}★ ({reviewCount}{' '}
                            {reviewCount === 1 ? 'review' : 'reviews'})
                        </p>
                    )}
                </div>
                <h2 className="mb-4 font-semibold">Listings</h2>
                <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                    {listings.length === 0 ? (
                        <p className="col-span-full text-muted-foreground">
                            No listings yet.
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
