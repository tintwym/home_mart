import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CardElement,
    Elements,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem, SharedData } from '@/types';

type PaymentMethodItem = {
    id: string;
    brand: string;
    last4: string;
    is_default: boolean;
};

type MyanmarMethodItem = {
    id: string;
    type: string;
    type_label: string;
    identifier: string;
    identifier_masked: string;
    is_default: boolean;
};

type Props = {
    region?: string;
    paymentMethods: PaymentMethodItem[];
    stripePublishableKey: string | null;
    myanmarMethods?: MyanmarMethodItem[];
    myanmarTypes?: Record<string, string>;
};

function AddCardForm({
    clientSecret,
    onSuccess,
    onCancel,
}: {
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { t } = useTranslations();
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!stripe || !elements) return;

            const cardEl = elements.getElement(CardElement);
            if (!cardEl) {
                setError(t('payment.card_not_ready'));
                return;
            }

            setError(null);
            setProcessing(true);

            const { error: confirmError } = await stripe.confirmCardSetup(
                clientSecret,
                {
                    payment_method: { card: cardEl },
                },
            );

            if (confirmError) {
                setError(confirmError.message ?? t('payment.add_card_failed'));
                setProcessing(false);
                return;
            }

            onSuccess();
        },
        [stripe, elements, clientSecret, onSuccess, t],
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border border-input bg-background px-3 py-2.5">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                fontFamily: 'inherit',
                            },
                        },
                    }}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={onCancel}>
                    {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            {t('payment.adding')}
                        </>
                    ) : (
                        t('payment.add_card')
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}

const MYANMAR_IDENTIFIER_LABELS: Record<string, string> = {
    mpu: 'Last 4 digits of card',
    kbz_pay: 'Phone number (e.g. 09xxxxxxxx)',
    aya_pay: 'Phone number (e.g. 09xxxxxxxx)',
    wave_pay: 'Phone number (e.g. 09xxxxxxxx)',
    cb_pay: 'Phone number (e.g. 09xxxxxxxx)',
};

export default function PaymentSettings({
    region = '',
    paymentMethods = [],
    stripePublishableKey,
    myanmarMethods = [],
    myanmarTypes = {},
}: Props) {
    const { t } = useTranslations();
    const isSingapore = region === 'SG';
    const isMyanmar = region === 'MM';
    const canManageCards = isSingapore && !!stripePublishableKey;
    const canManageMyanmar = isMyanmar;
    const [addCardOpen, setAddCardOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.payment'),
            href: '/settings/payment',
        },
    ];
    const [addMyanmarOpen, setAddMyanmarOpen] = useState(false);
    const [myanmarType, setMyanmarType] = useState<string>('mpu');
    const [myanmarIdentifier, setMyanmarIdentifier] = useState('');
    const [setupClientSecret, setSetupClientSecret] = useState<string | null>(
        null,
    );
    const [loadingSetup, setLoadingSetup] = useState(false);
    const pageProps = usePage<SharedData>().props as Record<string, unknown>;
    const flash = pageProps.flash as
        | { status?: string; error?: string }
        | undefined;

    const handleOpenAddCard = useCallback(async () => {
        setLoadingSetup(true);
        setAddCardOpen(true);
        try {
            const res = await fetch('/settings/payment/setup-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const data = await res.json();
            if (data.clientSecret) {
                setSetupClientSecret(data.clientSecret);
            } else {
                setAddCardOpen(false);
            }
        } catch {
            setAddCardOpen(false);
        } finally {
            setLoadingSetup(false);
        }
    }, []);

    const handleAddCardSuccess = useCallback(() => {
        setAddCardOpen(false);
        setSetupClientSecret(null);
        router.visit('/settings/payment', { preserveScroll: true });
    }, []);

    const stripePromise = stripePublishableKey
        ? loadStripe(stripePublishableKey)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.payment')} />

            <h1 className="sr-only">{t('settings.payment')}</h1>

            <SettingsLayout mobilePageTitle={t('settings.payment')}>
                <Heading
                    variant="small"
                    title={t('settings.payment')}
                    description={t('settings.payment_description')}
                />

                {flash?.status && (
                    <p className="mb-4 text-sm text-green-600">
                        {flash.status}
                    </p>
                )}
                {flash?.error && (
                    <p className="mb-4 text-sm text-destructive">
                        {flash.error}
                    </p>
                )}

                {canManageMyanmar && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {t('payment.myanmar_heading')}
                            </h2>
                            <Button
                                type="button"
                                onClick={() => {
                                    setMyanmarType('mpu');
                                    setMyanmarIdentifier('');
                                    setAddMyanmarOpen(true);
                                }}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                <Plus className="mr-2 size-4" />
                                {t('payment.add_method')}
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {t('payment.add_myanmar')}
                        </p>
                        <div className="divide-y divide-border rounded-lg border border-border bg-card">
                            {myanmarMethods.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                    {t('payment.no_methods')}
                                </div>
                            ) : (
                                myanmarMethods.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-10 items-center justify-center rounded border border-border bg-muted/50 px-2">
                                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                                    {m.type_label}
                                                </span>
                                            </div>
                                            <span className="font-medium tabular-nums">
                                                {m.identifier_masked}
                                            </span>
                                            {m.is_default && (
                                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                    {t('payment.default')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <Link
                                                href={`/settings/payment/${encodeURIComponent(m.id)}`}
                                                method="delete"
                                                as="button"
                                                className="text-sm text-destructive underline hover:no-underline"
                                            >
                                                {t('common.delete')}
                                            </Link>
                                            {!m.is_default && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            '/settings/payment/default',
                                                            {
                                                                payment_method_id:
                                                                    m.id,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {t('payment.set_default')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {canManageMyanmar && canManageCards && (
                    <hr className="my-6 border-border" />
                )}

                {!canManageCards && !canManageMyanmar ? (
                    <div className="rounded-lg border border-border bg-card p-4">
                        {isSingapore ? (
                            <p className="text-sm text-muted-foreground">
                                {t('payment.stripe_env_hint')}
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('payment.region_not_configured')}
                            </p>
                        )}
                    </div>
                ) : canManageCards ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {t('payment.credit_debit_card')}
                            </h2>
                            <Button
                                type="button"
                                onClick={handleOpenAddCard}
                                disabled={loadingSetup}
                                className="bg-orange-500 hover:bg-orange-600"
                            >
                                {loadingSetup ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 size-4" />
                                )}
                                {t('payment.add_card')}
                            </Button>
                        </div>

                        <div className="divide-y divide-border rounded-lg border border-border bg-card">
                            {paymentMethods.length === 0 ? (
                                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                    {t('payment.no_cards')}
                                </div>
                            ) : (
                                paymentMethods.map((pm) => (
                                    <div
                                        key={pm.id}
                                        className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-10 items-center justify-center rounded border border-border bg-muted/50 px-2">
                                                <span className="text-xs font-medium text-muted-foreground uppercase">
                                                    {pm.brand}
                                                </span>
                                            </div>
                                            <span className="font-medium tabular-nums">
                                                **** **** **** {pm.last4}
                                            </span>
                                            {pm.is_default && (
                                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                    {t('payment.default')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <Link
                                                href={`/settings/payment/${encodeURIComponent(pm.id)}`}
                                                method="delete"
                                                as="button"
                                                className="text-sm text-destructive underline hover:no-underline"
                                            >
                                                {t('common.delete')}
                                            </Link>
                                            {!pm.is_default && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.post(
                                                            '/settings/payment/default',
                                                            {
                                                                payment_method_id:
                                                                    pm.id,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {t('payment.set_default')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : null}

                <Dialog
                    open={addMyanmarOpen}
                    onOpenChange={(open) => {
                        setAddMyanmarOpen(open);
                        if (!open) setMyanmarIdentifier('');
                    }}
                >
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t('payment.add_method')}</DialogTitle>
                            <DialogDescription>
                                {t('payment.add_myanmar')}
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                router.post('/settings/payment', {
                                    type: myanmarType,
                                    identifier: myanmarIdentifier.trim(),
                                });
                                setAddMyanmarOpen(false);
                                setMyanmarIdentifier('');
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label
                                    htmlFor="myanmar-type"
                                    className="text-sm font-medium"
                                >
                                    Type
                                </label>
                                <select
                                    id="myanmar-type"
                                    value={myanmarType}
                                    onChange={(e) =>
                                        setMyanmarType(e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    {Object.entries(myanmarTypes).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="myanmar-identifier"
                                    className="text-sm font-medium"
                                >
                                    {MYANMAR_IDENTIFIER_LABELS[myanmarType] ??
                                        'Identifier'}
                                </label>
                                <input
                                    id="myanmar-identifier"
                                    type="text"
                                    value={myanmarIdentifier}
                                    onChange={(e) =>
                                        setMyanmarIdentifier(e.target.value)
                                    }
                                    placeholder={
                                        myanmarType === 'mpu'
                                            ? 'e.g. 1234'
                                            : 'e.g. 09123456789'
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                    maxLength={50}
                                />
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setAddMyanmarOpen(false)}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit">
                                    {t('payment.add')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t('payment.add_card')}</DialogTitle>
                            <DialogDescription>
                                Enter your card details below. Your card will be
                                saved for future checkouts.
                            </DialogDescription>
                        </DialogHeader>
                        {stripePromise && setupClientSecret && (
                            <Elements stripe={stripePromise}>
                                <AddCardForm
                                    clientSecret={setupClientSecret}
                                    onSuccess={handleAddCardSuccess}
                                    onCancel={() => setAddCardOpen(false)}
                                />
                            </Elements>
                        )}
                        {addCardOpen && !setupClientSecret && !loadingSetup && (
                            <p className="text-sm text-destructive">
                                Could not load form. Please try again.
                            </p>
                        )}
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
