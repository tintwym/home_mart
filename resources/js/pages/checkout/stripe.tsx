import { Head, Link } from '@inertiajs/react';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';

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
    };
};

type Order = {
    id: string;
    total: number;
    items: OrderItem[];
};

type Props = {
    clientSecret: string;
    order: Order;
    stripePublishableKey: string;
};

function CheckoutForm({ order }: { order: Order }) {
    const stripe = useStripe();
    const elements = useElements();
    const { formatPrice } = useCurrency();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setError(null);
        setProcessing(true);

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success?order_id=${order.id}`,
                receipt_email: undefined,
            },
        });

        if (submitError) {
            setError(submitError.message ?? 'Payment failed.');
        }
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement
                options={
                    {
                        layout: 'accordion',
                        defaultCollapsed: false,
                        radios: true,
                        spacedAccordionItems: true,
                        wallets: { link: 'never' },
                    } as React.ComponentProps<typeof PaymentElement>['options']
                }
            />
            {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </p>
            )}
            <Button
                type="submit"
                disabled={!stripe || processing}
                className="min-h-12 w-full font-semibold"
            >
                {processing ? (
                    <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Processing…
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 size-5" />
                        Pay {formatPrice(order.total)}
                    </>
                )}
            </Button>
        </form>
    );
}

const darkAppearance = {
    theme: 'night' as const,
    variables: {
        colorPrimary: '#2dd4bf',
        colorBackground: '#171717',
        colorText: '#fafafa',
        colorTextSecondary: '#a3a3a3',
        colorDanger: '#ef4444',
        colorBorder: '#3d3d3d',
        borderRadius: '8px',
    },
};

const lightAppearance = {
    theme: 'stripe' as const,
    variables: {
        colorPrimary: '#2dd4bf',
        colorBackground: '#ffffff',
        colorText: '#171717',
        colorTextSecondary: '#737373',
        colorDanger: '#ef4444',
        colorBorder: '#e5e5e5',
        borderRadius: '8px',
    },
};

export default function CheckoutStripe({
    clientSecret,
    order,
    stripePublishableKey,
}: Props) {
    const stripePromise = stripePublishableKey
        ? loadStripe(stripePublishableKey)
        : null;
    const { resolvedAppearance } = useAppearance();
    const { formatPrice } = useCurrency();

    if (!stripePromise) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Checkout" />
                <div className="mx-auto max-w-2xl px-4 py-8">
                    <p className="text-destructive">
                        Stripe is not configured.
                    </p>
                    <Link
                        href="/cart"
                        className="mt-4 inline-block text-primary hover:underline"
                    >
                        Back to cart
                    </Link>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Checkout – Pay with Card" />
            <div className="mx-auto max-w-2xl px-0 pt-6 pb-6 sm:px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 -ml-1 flex min-h-[44px] justify-start"
                    asChild
                >
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        Back to cart
                    </Link>
                </Button>

                <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

                <div className="grid grid-cols-[minmax(0,280px),1fr] gap-6">
                    <div className="rounded-xl border border-border bg-muted/30 p-6">
                        <h2 className="mb-4 font-semibold">Order summary</h2>
                        <ul className="space-y-3">
                            {order.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-3"
                                >
                                    {(item.listing.image_url ??
                                    item.listing.image_path) ? (
                                        <img
                                            src={
                                                item.listing.image_url ??
                                                item.listing.image_path ??
                                                ''
                                            }
                                            alt=""
                                            className="size-12 shrink-0 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                                            —
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {item.listing.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatPrice(item.price)} ×{' '}
                                            {item.quantity}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 border-t border-border pt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Total
                                </span>
                                <span className="font-bold">
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <h2 className="mb-4 flex items-center gap-2 font-semibold">
                            <CreditCard className="size-5" />
                            Payment details
                        </h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Pay securely with your card.
                        </p>
                        <Elements
                            stripe={stripePromise}
                            options={{
                                clientSecret,
                                appearance:
                                    resolvedAppearance === 'dark'
                                        ? darkAppearance
                                        : lightAppearance,
                                locale: 'en',
                            }}
                        >
                            <CheckoutForm order={order} />
                        </Elements>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
