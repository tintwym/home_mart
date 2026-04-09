import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Footprints,
    Shirt,
    ShoppingCart,
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
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.listing.price),
        0,
    );
    const region = items[0]?.listing.user?.region ?? undefined;
    const shippingEstimate = subtotal > 0 ? 5 : 0;
    const taxEstimate =
        subtotal > 0 ? Math.round(subtotal * 0.084 * 100) / 100 : 0;
    const orderTotal = subtotal + shippingEstimate + taxEstimate;

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
            <div className="mx-auto max-w-2xl px-4 pt-10 pb-16 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Shopping Cart
                </h1>
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
                    <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
                        <section
                            aria-labelledby="cart-heading"
                            className="lg:col-span-7"
                        >
                            <h2 id="cart-heading" className="sr-only">
                                Items in your shopping cart
                            </h2>

                            {Object.entries(bySeller).map(
                                ([sellerId, sellerItems], idx) => (
                                    <div
                                        key={sellerId}
                                        className={
                                            idx > 0
                                                ? 'mt-10 border-t border-border pt-10'
                                                : ''
                                        }
                                    >
                                        {/* Seller info */}
                                        {sellerItems[0]?.listing.user && (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9 shrink-0">
                                                    <AvatarFallback className="text-xs font-medium">
                                                        {getInitials(
                                                            sellerItems[0]
                                                                .listing.user
                                                                .name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium">
                                                    {
                                                        sellerItems[0].listing
                                                            .user.name
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        <ul
                                            role="list"
                                            className="mt-4 divide-y divide-border border-t border-b border-border"
                                        >
                                            {sellerItems.map(
                                                (item, productIdx) => (
                                                    <li
                                                        key={item.id}
                                                        className="flex py-6 sm:py-10"
                                                    >
                                                        <Link
                                                            href={`/listings/${item.listing.id}`}
                                                            className="shrink-0 overflow-hidden rounded-md bg-muted"
                                                        >
                                                            {(item.listing
                                                                .image_url ??
                                                            item.listing
                                                                .image_path) ? (
                                                                <img
                                                                    src={
                                                                        item
                                                                            .listing
                                                                            .image_url ??
                                                                        item
                                                                            .listing
                                                                            .image_path ??
                                                                        ''
                                                                    }
                                                                    alt=""
                                                                    className="size-24 object-cover sm:size-48"
                                                                />
                                                            ) : (
                                                                <div className="flex size-24 items-center justify-center text-xs text-muted-foreground sm:size-48">
                                                                    —
                                                                </div>
                                                            )}
                                                        </Link>
                                                        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                                            <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                                <div>
                                                                    <div className="flex justify-between">
                                                                        <h3 className="text-sm">
                                                                            <Link
                                                                                href={`/listings/${item.listing.id}`}
                                                                                className="font-medium text-foreground hover:underline"
                                                                            >
                                                                                {
                                                                                    item
                                                                                        .listing
                                                                                        .title
                                                                                }
                                                                            </Link>
                                                                        </h3>
                                                                    </div>
                                                                    <div className="mt-1 flex text-sm">
                                                                        <p className="text-muted-foreground">
                                                                            {CONDITION_LABELS[
                                                                                item
                                                                                    .listing
                                                                                    .condition ??
                                                                                    ''
                                                                            ] ??
                                                                                item
                                                                                    .listing
                                                                                    .condition ??
                                                                                '—'}
                                                                        </p>
                                                                        <p className="ml-4 border-l border-border pl-4 text-muted-foreground">
                                                                            Buyer
                                                                            Protection
                                                                        </p>
                                                                    </div>
                                                                    <p className="mt-1 text-sm font-medium">
                                                                        {formatPrice(
                                                                            item
                                                                                .listing
                                                                                .price,
                                                                            item
                                                                                .listing
                                                                                .user
                                                                                ?.region,
                                                                        )}
                                                                    </p>
                                                                </div>

                                                                <div className="mt-4 sm:mt-0 sm:pr-9">
                                                                    <div className="grid w-full max-w-16 grid-cols-1">
                                                                        <select
                                                                            name={`quantity-${productIdx}`}
                                                                            aria-label={`Quantity, ${item.listing.title}`}
                                                                            disabled
                                                                            value={
                                                                                1
                                                                            }
                                                                            className="col-start-1 row-start-1 appearance-none rounded-md bg-background py-1.5 pr-8 pl-3 text-base outline-1 -outline-offset-1 outline-border focus:outline-2 focus:-outline-offset-2 focus:outline-primary disabled:opacity-70 sm:text-sm/6"
                                                                        >
                                                                            <option
                                                                                value={
                                                                                    1
                                                                                }
                                                                            >
                                                                                1
                                                                            </option>
                                                                        </select>
                                                                        <ChevronDown className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-muted-foreground sm:size-4" />
                                                                    </div>

                                                                    <div className="absolute top-0 right-0">
                                                                        <button
                                                                            type="button"
                                                                            className="-m-2 inline-flex p-2 text-muted-foreground hover:text-foreground"
                                                                            onClick={() =>
                                                                                removeFromCart(
                                                                                    item
                                                                                        .listing
                                                                                        .id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <span className="sr-only">
                                                                                Remove
                                                                            </span>
                                                                            <Trash2 className="size-5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <p className="mt-4 flex space-x-2 text-sm text-foreground">
                                                                <Check className="size-5 shrink-0 text-green-500" />
                                                                <span>
                                                                    In stock
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                ),
                            )}
                        </section>

                        <section
                            aria-labelledby="summary-heading"
                            className="mt-16 rounded-lg bg-muted/30 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
                        >
                            <h2
                                id="summary-heading"
                                className="text-lg font-medium"
                            >
                                Order summary
                            </h2>

                            <dl className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-muted-foreground">
                                        Subtotal
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {formatPrice(subtotal, region)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <dt className="text-sm text-muted-foreground">
                                        Shipping estimate
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {formatPrice(shippingEstimate, region)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <dt className="text-sm text-muted-foreground">
                                        Tax estimate
                                    </dt>
                                    <dd className="text-sm font-medium">
                                        {formatPrice(taxEstimate, region)}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-border pt-4">
                                    <dt className="text-base font-medium">
                                        Order total
                                    </dt>
                                    <dd className="text-base font-medium">
                                        {formatPrice(orderTotal, region)}
                                    </dd>
                                </div>
                            </dl>

                            <div className="mt-6">
                                <Button
                                    type="button"
                                    className="w-full bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700"
                                    disabled={processing}
                                    onClick={() => post('/checkout')}
                                >
                                    Checkout
                                </Button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
