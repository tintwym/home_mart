import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    MapPin,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    Star,
    Tag,
    Users,
} from 'lucide-react';
import { AdSlot } from '@/components/ad-slot';
import InputError from '@/components/input-error';
import {
    ListingCard,
    type ListingCardListing,
} from '@/components/listing-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types';

const CONDITION_KEYS: Record<string, string> = {
    new: 'listing.condition_new',
    like_new: 'listing.condition_like_new',
    good: 'listing.condition_good',
    fair: 'listing.condition_fair',
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatRelativeTime(
    dateString: string,
    t: (key: string, params?: Record<string, string | number>) => string,
): string {
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
    if (diffDays === 1) return t('time.day_ago');
    if (diffDays < 7) return t('time.days_ago', { count: diffDays });
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1
            ? t('time.week_ago')
            : t('time.weeks_ago', { count: weeks });
    }
    return formatDate(dateString);
}

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user: { id: string; name: string } | null;
};

type Category = {
    id: string;
    name: string;
    slug: string;
};

type Listing = {
    id: string;
    title: string;
    description: string;
    condition: string;
    price: number;
    image_path: string | null;
    image_url?: string | null;
    meetup_location: string | null;
    created_at: string;
    category?: Category | null;
    user?: {
        id: string;
        name: string;
        seller_type?: string;
        region?: string | null;
    } | null;
    reviews: Review[];
};

type Props = {
    listing: Listing & { trending_until?: string | null };
    averageRating: number;
    reviewCount: number;
    trendPriceLabel: string;
    trendDurationDays: number;
    relatedListings: ListingCardListing[];
};

export default function ShowListing({
    listing,
    averageRating,
    reviewCount,
    trendPriceLabel,
    relatedListings,
}: Props) {
    const pageProps = usePage<SharedData>().props as SharedData & {
        flash?: { status?: string; error?: string };
    };
    const { auth } = pageProps;
    const flash = pageProps.flash;
    const { formatPrice } = useCurrency();
    const { t, categoryName } = useTranslations();
    const userReview = listing.reviews.find(
        (r) => r.user?.id === auth?.user?.id,
    );
    const { data, setData, post, processing, errors } = useForm({
        rating: userReview?.rating ?? 5,
        comment: userReview?.comment ?? '',
    });

    const canReview = auth?.user && auth.user.id !== listing.user?.id;
    const isOwner = auth?.user && auth.user.id === listing.user?.id;
    const isTrending =
        listing.trending_until && new Date(listing.trending_until) > new Date();
    const isBuyer = auth?.user && auth.user.id !== listing.user?.id;
    const isGuest = !auth?.user;
    const showBuyerActions = !isOwner && (isBuyer || isGuest);
    const isBusinessSeller = listing.user?.seller_type === 'business';

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/listings/${listing.id}/reviews`);
    };

    /* Sidebar: full-width stacked buttons (Buy first, Add to cart second) */
    const sidebarBuyerActions = isBusinessSeller ? (
        <div className="flex flex-col gap-2">
            {auth?.cartListingIds?.includes(listing.id) ? (
                <>
                    <Button className="w-full" asChild>
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2"
                        >
                            <ShoppingBag className="mr-2 size-4" />
                            {t('listing.buy')}
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link
                            href="/cart"
                            className="inline-flex items-center gap-2"
                        >
                            <ShoppingCart className="mr-2 size-4" />
                            {t('listing.in_cart')}
                        </Link>
                    </Button>
                </>
            ) : (
                <>
                    <Button
                        className="w-full"
                        onClick={() =>
                            router.post(`/listings/${listing.id}/cart`, {
                                intent: 'buy',
                            })
                        }
                    >
                        <ShoppingBag className="mr-2 size-4" />
                        {t('listing.buy')}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                            router.post(`/listings/${listing.id}/cart`)
                        }
                    >
                        <ShoppingCart className="mr-2 size-4" />
                        {t('listing.add_to_cart')}
                    </Button>
                </>
            )}
        </div>
    ) : (
        <Button
            variant="outline"
            className="w-full"
            onClick={() => router.post(`/listings/${listing.id}/chat`)}
        >
            {t('listing.make_offer')}
        </Button>
    );

    const sidebarGuestActions = isBusinessSeller ? (
        <div className="flex flex-col gap-2">
            <Button className="w-full" asChild>
                <Link href="/login" className="inline-flex items-center gap-2">
                    <ShoppingBag className="mr-2 size-4" />
                    {t('listing.sign_in_to_buy')}
                </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/login" className="inline-flex items-center gap-2">
                    <ShoppingCart className="mr-2 size-4" />
                    {t('listing.sign_in_to_add_to_cart')}
                </Link>
            </Button>
        </div>
    ) : (
        <Button variant="outline" className="w-full" asChild>
            <Link href="/login">{t('listing.sign_in_to_make_offer')}</Link>
        </Button>
    );

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={listing.title} />
            <div className="mx-auto w-full max-w-6xl px-0 pb-24 sm:px-2 lg:pb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-1 flex min-h-[44px] touch-manipulation justify-start sm:min-h-8"
                    asChild
                >
                    <Link
                        href={dashboard().url}
                        className="inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        {t('common.back')}
                    </Link>
                </Button>

                {flash?.status && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
                        {flash.status}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                {/* Large product image at top (Carousell-style) */}
                <div className="mb-8 aspect-square w-full overflow-hidden rounded-xl bg-muted sm:aspect-[4/3]">
                    {(listing.image_url ?? listing.image_path) ? (
                        <img
                            src={listing.image_url ?? listing.image_path ?? ''}
                            alt={listing.title}
                            className="size-full object-contain"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                            {t('listing.no_image')}
                        </div>
                    )}
                </div>

                <div className="grid gap-8 md:grid-cols-[1fr,320px]">
                    {/* Main content - left */}
                    <div className="min-w-0 space-y-8">
                        {/* Title + price */}
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {listing.title}
                            </h1>
                            <p className="mt-2 text-3xl font-bold">
                                {formatPrice(
                                    listing.price,
                                    listing.user?.region,
                                )}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                    <Tag className="size-4 shrink-0" />
                                    {CONDITION_KEYS[listing.condition]
                                        ? t(CONDITION_KEYS[listing.condition])
                                        : listing.condition}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="size-4 shrink-0" />
                                    {listing.meetup_location
                                        ? t('listing.meetup')
                                        : t('listing.meet_up')}
                                </span>
                                {listing.meetup_location && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <MapPin className="size-4 shrink-0" />
                                        {listing.meetup_location}
                                    </span>
                                )}
                                {listing.category && (
                                    <span>
                                        {t('listing.category')}{' '}
                                        <Link
                                            href={`/categories/${listing.category.slug}`}
                                            className="font-medium text-foreground hover:underline"
                                        >
                                            {categoryName(listing.category)}
                                        </Link>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Details */}
                        <section>
                            <h2 className="mb-4 font-semibold">
                                {t('listing.details')}
                            </h2>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm text-muted-foreground">
                                        {t('listing.listed')}
                                    </dt>
                                    <dd className="mt-1">
                                        {formatRelativeTime(
                                            listing.created_at,
                                            t,
                                        )}
                                        {listing.user && (
                                            <>
                                                {t('listing.listed_by')}
                                                <span className="font-medium">
                                                    {listing.user.name}
                                                </span>
                                            </>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        {/* Description */}
                        <section>
                            <h2 className="mb-4 font-semibold">
                                {t('listing.description')}
                            </h2>
                            <p className="whitespace-pre-wrap text-muted-foreground">
                                {listing.description ||
                                    t('listing.no_description')}
                            </p>
                        </section>

                        {/* Deal method */}
                        <section>
                            <h2 className="mb-4 font-semibold">
                                {t('listing.deal_method')}
                            </h2>
                            <p className="text-muted-foreground">
                                {listing.meetup_location
                                    ? t('listing.meetup_with_location', {
                                          location: listing.meetup_location,
                                      })
                                    : t('listing.meet_up')}
                            </p>
                        </section>

                        {/* Reviews for [Seller] */}
                        <section className="border-t pt-8">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold">
                                    {t('listing.reviews_for')}{' '}
                                    {listing.user?.name ?? t('listing.seller')}
                                    {reviewCount > 0 && (
                                        <span className="ml-2 font-normal text-muted-foreground">
                                            {averageRating.toFixed(1)}★ (
                                            {reviewCount}{' '}
                                            {reviewCount === 1
                                                ? t('listing.review')
                                                : t('listing.reviews')}
                                            )
                                        </span>
                                    )}
                                </h2>
                                {reviewCount > 0 && (
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`size-5 ${
                                                    star <=
                                                    Math.round(averageRating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-muted-foreground'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {canReview && (
                                <form
                                    onSubmit={submitReview}
                                    className="mt-6 rounded-lg border border-border/50 bg-muted/20 p-4 sm:p-6"
                                >
                                    <h3 className="mb-4 font-medium">
                                        {userReview
                                            ? t('listing.update_your_review')
                                            : t('listing.write_a_review')}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>{t('listing.rating')}</Label>
                                            <InputError
                                                message={errors.rating}
                                            />
                                            <div className="mt-2 flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() =>
                                                            setData(
                                                                'rating',
                                                                star,
                                                            )
                                                        }
                                                        className="focus:outline-none"
                                                    >
                                                        <Star
                                                            className={`size-8 transition-colors ${
                                                                star <=
                                                                data.rating
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-muted-foreground hover:text-amber-400/70'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="comment">
                                                {t('listing.comment_optional')}
                                            </Label>
                                            <textarea
                                                id="comment"
                                                rows={4}
                                                value={data.comment}
                                                onChange={(e) =>
                                                    setData(
                                                        'comment',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={t(
                                                    'listing.review_placeholder',
                                                )}
                                                className="mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            />
                                            <InputError
                                                message={errors.comment}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {userReview
                                                ? t('listing.update_review')
                                                : t('listing.submit_review')}
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {!auth?.user && (
                                <p className="mt-6 text-sm text-muted-foreground">
                                    <Link
                                        href="/login"
                                        className="font-medium hover:underline"
                                    >
                                        {t('listing.sign_in_to_leave_review')}
                                    </Link>
                                </p>
                            )}

                            <div className="mt-8 space-y-6">
                                {listing.reviews.length === 0 ? (
                                    <p className="text-muted-foreground">
                                        {t('listing.no_reviews_yet')}
                                    </p>
                                ) : (
                                    listing.reviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="rounded-lg border border-border/50 p-4"
                                        >
                                            <div className="flex gap-4">
                                                <Avatar className="size-10 shrink-0">
                                                    <AvatarFallback className="text-xs font-medium">
                                                        {review.user
                                                            ? getInitials(
                                                                  review.user
                                                                      .name,
                                                              )
                                                            : '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <p className="font-medium">
                                                            {review.user
                                                                ?.name ??
                                                                t(
                                                                    'listing.anonymous',
                                                                )}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatRelativeTime(
                                                                review.created_at,
                                                                t,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1 flex">
                                                        {[1, 2, 3, 4, 5].map(
                                                            (star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`size-4 ${
                                                                        star <=
                                                                        review.rating
                                                                            ? 'fill-amber-400 text-amber-400'
                                                                            : 'text-muted-foreground'
                                                                    }`}
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                    {review.comment && (
                                                        <p className="mt-3 text-sm text-muted-foreground">
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        {listing.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Meet the seller + Buy/Add to cart (right side, Carousell-style) */}
                    <aside className="hidden md:sticky md:top-4 md:block md:self-start">
                        <div className="space-y-6 rounded-xl border border-border/50 bg-muted/20 p-6">
                            <h2 className="font-semibold">
                                {t('listing.meet_the_seller')}
                            </h2>
                            {listing.user && (
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-14 shrink-0">
                                        <AvatarImage
                                            src={undefined}
                                            alt={listing.user.name}
                                        />
                                        <AvatarFallback className="text-base font-medium">
                                            {getInitials(listing.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">
                                            {listing.user.name}
                                        </p>
                                        {reviewCount > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                {averageRating.toFixed(1)}★ (
                                                {reviewCount}{' '}
                                                {reviewCount === 1
                                                    ? t('listing.review')
                                                    : t('listing.reviews')}
                                                )
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                {isOwner ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link
                                                href={`/listings/${listing.id}/edit`}
                                            >
                                                {t('listing.edit_listing')}
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            disabled={!!isTrending}
                                            onClick={() =>
                                                !isTrending &&
                                                router.post(
                                                    `/listings/${listing.id}/promote`,
                                                )
                                            }
                                        >
                                            <Sparkles className="mr-2 size-4" />
                                            {isTrending
                                                ? t('listing.promoted')
                                                : t('listing.make_it_trend', {
                                                      price: trendPriceLabel,
                                                  })}
                                        </Button>
                                    </>
                                ) : (
                                    showBuyerActions &&
                                    (auth?.user
                                        ? sidebarBuyerActions
                                        : sidebarGuestActions)
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related products */}
                {relatedListings.length > 0 && (
                    <section className="mt-12 border-t pt-8">
                        <h2 className="mb-4 text-xl font-semibold">
                            {t('listing.related_products')}
                        </h2>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-3">
                            {relatedListings.map((rel) => (
                                <li key={rel.id}>
                                    <ListingCard listing={rel} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Ad slot - below main content */}
                <AdSlot slotId="listing-below" className="mt-8" />

                {/* Mobile sticky footer - Buy first, Add to cart second. Shown when sidebar hidden (below md). */}
                {showBuyerActions && isBusinessSeller && auth?.user && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        {auth.cartListingIds?.includes(listing.id) ? (
                            <>
                                <Button
                                    className="min-h-12 flex-1 touch-manipulation"
                                    asChild
                                >
                                    <Link
                                        href="/cart"
                                        className="inline-flex items-center gap-2"
                                    >
                                        <ShoppingBag className="size-4" />
                                        {t('listing.buy')}
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="min-h-12 flex-1 touch-manipulation"
                                    asChild
                                >
                                    <Link
                                        href="/cart"
                                        className="inline-flex items-center gap-2"
                                    >
                                        <ShoppingCart className="size-4" />
                                        {t('listing.in_cart')}
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    className="min-h-12 flex-1 touch-manipulation"
                                    onClick={() =>
                                        router.post(
                                            `/listings/${listing.id}/cart`,
                                            { intent: 'buy' },
                                        )
                                    }
                                >
                                    <ShoppingBag className="mr-2 size-4" />
                                    {t('listing.buy')}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="min-h-12 flex-1 touch-manipulation"
                                    onClick={() =>
                                        router.post(
                                            `/listings/${listing.id}/cart`,
                                        )
                                    }
                                >
                                    <ShoppingCart className="mr-2 size-4" />
                                    {t('listing.add_to_cart')}
                                </Button>
                            </>
                        )}
                    </div>
                )}
                {showBuyerActions && !isBusinessSeller && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        <Button
                            variant="outline"
                            className="min-h-12 flex-1 touch-manipulation"
                            onClick={() =>
                                router.post(`/listings/${listing.id}/chat`)
                            }
                        >
                            {t('listing.make_offer')}
                        </Button>
                    </div>
                )}
                {isGuest && isBusinessSeller && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        <Button
                            className="min-h-12 flex-1 touch-manipulation"
                            asChild
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2"
                            >
                                <ShoppingBag className="size-4" />
                                {t('listing.sign_in_to_buy')}
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="min-h-12 flex-1 touch-manipulation"
                            asChild
                        >
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2"
                            >
                                <ShoppingCart className="size-4" />
                                {t('listing.sign_in_to_add_to_cart')}
                            </Link>
                        </Button>
                    </div>
                )}
                {isGuest && !isBusinessSeller && (
                    <div className="fixed right-0 bottom-0 left-0 z-50 flex gap-3 border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
                        <Button
                            variant="outline"
                            className="min-h-12 flex-1 touch-manipulation"
                            asChild
                        >
                            <Link href="/login">
                                {t('listing.sign_in_to_make_offer')}
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
