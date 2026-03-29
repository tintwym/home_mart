import { Link, router, usePage } from '@inertiajs/react';
import { MoreVertical, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslations } from '@/hooks/use-translations';
import type { SharedData } from '@/types';

const CONDITION_KEYS: Record<string, string> = {
    new: 'listing.condition_new',
    like_new: 'listing.condition_like_new',
    good: 'listing.condition_good',
    fair: 'listing.condition_fair',
};

function formatRelativeTime(
    dateString: string | undefined,
    t: (key: string, params?: Record<string, string | number>) => string,
): string {
    if (!dateString) return t('time.recently');
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.just_now');
    if (diffMins < 60)
        return diffMins === 1
            ? t('time.minute_ago')
            : t('time.minutes_ago', { count: diffMins });
    if (diffHours < 24)
        return diffHours === 1
            ? t('time.hour_ago')
            : t('time.hours_ago', { count: diffHours });
    if (diffDays < 7)
        return diffDays === 1
            ? t('time.day_ago')
            : t('time.days_ago', { count: diffDays });

    return date.toLocaleDateString();
}

export type ListingCardListing = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    condition: string;
    price: number;
    image_path: string | null;
    image_url?: string | null;
    created_at?: string;
    category?: { id: string; name: string; slug: string } | null;
    user?: {
        id: string;
        name: string;
        avatar?: string;
        seller_type?: string;
        region?: string | null;
    } | null;
    trending_until?: string | null;
};

type ListingCardProps = {
    listing: ListingCardListing;
};

export function ListingCard({ listing }: ListingCardProps) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();
    const { formatPrice } = useCurrency();
    const canEdit = auth?.user && listing.user_id === auth.user.id;
    const isTrending =
        listing.trending_until && new Date(listing.trending_until) > new Date();
    const [imageError, setImageError] = useState(false);
    const imageSrc = listing.image_url ?? listing.image_path ?? null;
    const showImage = imageSrc && !imageError;

    return (
        <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-none transition-shadow hover:shadow-md dark:border-border/30 dark:bg-card">
            {/* Product image - Carousell style with overlay */}
            <Link
                href={`/listings/${listing.id}`}
                className="relative block aspect-square w-full overflow-hidden bg-muted"
            >
                {showImage ? (
                    <img
                        src={imageSrc}
                        alt=""
                        className="size-full object-cover transition-opacity hover:opacity-95"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        {t('listing.no_image')}
                    </div>
                )}
                {/* Overlay: time (top-left), trending badge, ellipsis (top-right) */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                    <div className="flex flex-col gap-1">
                        <span className="rounded bg-black/40 px-1.5 py-0.5 text-xs text-white">
                            {formatRelativeTime(listing.created_at, t)}
                        </span>
                        {isTrending && (
                            <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                                {t('listing.trending')}
                            </span>
                        )}
                    </div>
                    {canEdit && (
                        <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 shrink-0 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
                                        aria-label={t(
                                            'listing.listing_options',
                                        )}
                                    >
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`/listings/${listing.id}/edit`}
                                        >
                                            <Pencil className="mr-2 size-4" />
                                            {t('common.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            if (
                                                window.confirm(
                                                    t('listing.delete_confirm'),
                                                )
                                            ) {
                                                router.delete(
                                                    `/listings/${listing.id}`,
                                                );
                                            }
                                        }}
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        {t('common.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </Link>

            {/* Product details - compact Carousell style */}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 pt-2 pb-3">
                <Link
                    href={`/listings/${listing.id}`}
                    className="block min-w-0"
                >
                    <h3 className="line-clamp-2 text-sm leading-tight font-medium text-foreground hover:underline">
                        {listing.title}
                    </h3>
                </Link>
                <Link href={`/listings/${listing.id}`} className="inline-block">
                    <p className="text-base font-bold text-foreground hover:underline sm:text-lg">
                        {formatPrice(listing.price, listing.user?.region)}
                    </p>
                </Link>
                <p className="text-xs text-muted-foreground">
                    {CONDITION_KEYS[listing.condition]
                        ? t(CONDITION_KEYS[listing.condition])
                        : listing.condition}{' '}
                    · {listing.user?.name ?? t('common.unknown')}
                </p>

                {/* Add to cart - only for business sellers */}
                {auth?.user &&
                    auth.user.id !== listing.user_id &&
                    listing.user?.seller_type === 'business' && (
                        <div className="mt-1.5 pt-1">
                            {auth.cartListingIds?.includes(listing.id) ? (
                                <Link
                                    href="/cart"
                                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ShoppingCart className="size-4" />
                                    {t('listing.in_cart')}
                                </Link>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="-ml-1 h-8 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        router.post(
                                            `/listings/${listing.id}/cart`,
                                        )
                                    }
                                    aria-label={t('listing.add_to_cart')}
                                >
                                    <ShoppingCart className="mr-1 size-4" />
                                    {t('listing.add_to_cart')}
                                </Button>
                            )}
                        </div>
                    )}
            </div>
        </article>
    );
}
