import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Footprints,
    Shirt,
    ShoppingCart,
    ShieldCheck,
    Smartphone,
    Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

const CONDITION_LABELS: Record<string, string> = {
    new: 'Brand new',
    like_new: 'Lightly used',
    good: 'Good',
    fair: 'Fair',
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

type CartItem = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        image_url?: string | null;
        price: number;
        condition?: string;
        user: { id: string; name: string; region?: string | null };
    };
};

type Props = {
    items: CartItem[];
};

export default function CartIndex({ items }: Props) {
    const { post, processing } = useForm();
    const { formatPrice } = useCurrency();
    const total = items.reduce(
        (sum, item) => sum + Number(item.listing.price),
        0,
    );

    const removeFromCart = (listingId: string) => {
        router.delete(`/listings/${listingId}/cart`);
    };

    // Group items by seller
    const bySeller = items.reduce<Record<string, CartItem[]>>((acc, item) => {
        const sellerId = item.listing.user.id;
        if (!acc[sellerId]) acc[sellerId] = [];
        acc[sellerId].push(item);
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Cart" />
            <div className="mx-auto max-w-2xl px-0 sm:px-2">
                <h1 className="mb-6 text-xl font-bold">Cart</h1>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-8">
                            <ShoppingCart
                                className="size-24 text-blue-500"
                                strokeWidth={1.5}
                            />
                            <Smartphone className="absolute -top-4 -right-2 size-8 text-muted-foreground/80" />
                            <Shirt className="absolute top-2 -left-6 size-7 text-red-400/90" />
                            <Footprints className="absolute -bottom-2 -left-4 size-6 text-green-500/80" />
                            <span className="absolute top-1/2 -right-6 size-2 -translate-y-1/2 rounded-full bg-cyan-400/60" />
                            <span className="absolute top-4 -left-2 size-1.5 rounded-full bg-cyan-400/50" />
                        </div>
                        <p className="text-base text-foreground">
                            Add listings to your Cart to pay for them
                        </p>
                        <p className="text-base text-foreground">
                            at one go and save on delivery!
                        </p>
                        <Link
                            href={dashboard().url}
                            className="mt-6 inline-block font-medium text-primary hover:underline"
                        >
                            Browse listings
                        </Link>
                    </div>
                ) : (
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-6">
                        {Object.entries(bySeller).map(
                            ([sellerId, sellerItems], idx) => (
                                <div
                                    key={sellerId}
                                    className={
                                        idx > 0
                                            ? 'mt-6 space-y-4 border-t border-border/50 pt-6'
                                            : 'space-y-4'
                                    }
                                >
                                    {/* Seller info */}
                                    {sellerItems[0]?.listing.user && (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="size-9 shrink-0">
                                                <AvatarFallback className="text-xs font-medium">
                                                    {getInitials(
                                                        sellerItems[0].listing
                                                            .user.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">
                                                {
                                                    sellerItems[0].listing.user
                                                        .name
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* Product items - Carousell layout */}
                                    <div className="space-y-4">
                                        {sellerItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 rounded-lg border border-border/40 bg-muted/50 p-4"
                                            >
                                                <Link
                                                    href={`/listings/${item.listing.id}`}
                                                    className="shrink-0 overflow-hidden rounded-lg bg-muted"
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
                                                            className="size-20 object-cover sm:size-24"
                                                        />
                                                    ) : (
                                                        <div className="flex size-20 items-center justify-center text-xs text-muted-foreground sm:size-24">
                                                            —
                                                        </div>
                                                    )}
                                                </Link>
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        href={`/listings/${item.listing.id}`}
                                                        className="line-clamp-2 text-sm font-medium hover:underline"
                                                    >
                                                        {item.listing.title}
                                                    </Link>
                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {CONDITION_LABELS[
                                                            item.listing
                                                                .condition ?? ''
                                                        ] ??
                                                            item.listing
                                                                .condition ??
                                                            '—'}
                                                    </p>
                                                    <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-muted/80 px-2 py-0.5 text-xs text-muted-foreground">
                                                        <ShieldCheck className="size-3.5" />
                                                        Buyer Protection
                                                    </span>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-2">
                                                    <p className="text-sm font-semibold">
                                                        {formatPrice(
                                                            item.listing.price,
                                                            item.listing.user
                                                                ?.region,
                                                        )}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.listing.id,
                                                            )
                                                        }
                                                        aria-label="Remove from cart"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}

                        {/* Summary + Checkout - exactly like reference */}
                        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-5">
                            <p className="text-sm text-muted-foreground">
                                {items.length}{' '}
                                {items.length === 1 ? 'item' : 'items'} •{' '}
                                {formatPrice(total)}
                            </p>
                            <Button
                                type="button"
                                className="min-h-11 px-6 font-semibold"
                                disabled={processing}
                                onClick={() => post('/checkout')}
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
