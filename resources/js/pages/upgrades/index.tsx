import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Package, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type Props = {
    listingCount: number;
    maxListingSlots: number;
    slotPrice: number;
    slotPriceLabel: string;
    trendPrice: number;
    trendPriceLabel: string;
    trendDurationDays: number;
};

export default function UpgradesIndex({
    listingCount,
    maxListingSlots,
    slotPriceLabel,
    trendDurationDays,
}: Props) {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Upgrades" />
            <div className="mx-auto w-full max-w-2xl px-0 sm:px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-1 flex min-h-[44px] touch-manipulation justify-start sm:min-h-8"
                    asChild
                >
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Upgrades</h1>
                <p className="mt-2 text-muted-foreground">
                    Get more out of Home Mart with extra listing slots and
                    promotion.
                </p>

                <div className="mt-8 space-y-6">
                    {/* Extra listing slots */}
                    <section className="rounded-xl border border-border/50 bg-muted/20 p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Package className="size-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold">
                                    Extra listing slots
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    You're using {listingCount} of{' '}
                                    {maxListingSlots} slots. Buy more to list
                                    additional items.
                                </p>
                                <Button
                                    className="mt-4"
                                    onClick={() =>
                                        router.post('/upgrades/slots')
                                    }
                                >
                                    {slotPriceLabel} — Buy 1 slot
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Trend promotion */}
                    <section className="rounded-xl border border-border/50 bg-muted/20 p-6">
                        <div className="flex items-start gap-4">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Sparkles className="size-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold">Make it trend</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Promote a listing that isn't selling.
                                    Trending items appear higher in search for{' '}
                                    {trendDurationDays} days.
                                </p>
                                <p className="mt-2 text-sm">
                                    Go to your listing and click &quot;Make it
                                    trend&quot; to promote.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
