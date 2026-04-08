import {
    CardElement,
    Elements,
    useElements,
    useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { Link, router } from '@inertiajs/react';
import { Camera, Loader2, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

export type CardPaymentMethodItem = {
    id: string;
    brand: string;
    last4: string;
    is_default: boolean;
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
    const [info, setInfo] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [cardInputError, setCardInputError] = useState<string | null>(null);
    const [cardComplete, setCardComplete] = useState(false);
    const [cardholderName, setCardholderName] = useState('');
    const [saveCard, setSaveCard] = useState(true);
    const [mode, setMode] = useState<'manual' | 'scan'>('manual');
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const stopStream = useCallback(() => {
        try {
            streamRef.current?.getTracks()?.forEach((t) => t.stop());
        } catch {
            // ignore
        }
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const startStream = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Camera is not available in this browser.');
            setMode('manual');
            return;
        }

        setError(null);
        setInfo(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch {
            setError('Could not access camera. Please enter your card manually.');
            setMode('manual');
        }
    }, []);

    // Only stop camera stream on unmount.
    useEffect(() => stopStream, [stopStream]);

    const canSubmit = useMemo(() => {
        if (processing) return false;
        if (!saveCard) return false;
        if (!cardComplete) return false;
        if (cardInputError) return false;
        return true;
    }, [processing, saveCard, cardComplete, cardInputError]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!stripe || !elements) return;

            if (!saveCard) {
                setInfo('Saving is turned off. Turn on “Save my card” to continue.');
                return;
            }

            const cardEl = elements.getElement(CardElement);
            if (!cardEl) {
                setError(t('payment.card_not_ready'));
                return;
            }

            setError(null);
            setInfo(null);
            setProcessing(true);

            const { error: confirmError } = await stripe.confirmCardSetup(
                clientSecret,
                {
                    payment_method: {
                        card: cardEl,
                        billing_details: {
                            name: cardholderName.trim() || undefined,
                        },
                    },
                },
            );

            if (confirmError) {
                setError(confirmError.message ?? t('payment.add_card_failed'));
                setProcessing(false);
                return;
            }

            onSuccess();
        },
        [stripe, elements, clientSecret, onSuccess, t, cardholderName, saveCard],
    );

    const handleScanCard = useCallback(() => {
        setMode('scan');
        void startStream();
    }, [startStream]);

    const goManual = useCallback(() => {
        stopStream();
        setMode('manual');
    }, [stopStream]);

    const handleScanUseManual = useCallback(() => {
        goManual();
        setInfo(
            'Card scanning isn’t supported on the web checkout yet. Please enter your card manually.',
        );
    }, [goManual]);

    return (
        <div className="space-y-4">
            {mode === 'manual' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">
                            Card details
                        </label>
                        <div className="rounded-xl border border-input bg-background px-4 py-3">
                            <CardElement
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            fontFamily: 'inherit',
                                        },
                                    },
                                }}
                                onChange={(e) => {
                                    setCardComplete(!!e.complete);
                                    setCardInputError(e.error?.message ?? null);
                                }}
                            />
                        </div>
                        {cardInputError ? (
                            <p className="text-xs text-destructive">
                                {cardInputError}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Card number, expiry date, and CVC are entered
                                securely.
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="cardholderName"
                            className="text-xs font-medium text-muted-foreground"
                        >
                            Cardholder’s Name
                        </label>
                        <input
                            id="cardholderName"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="Enter cardholder’s full name"
                            className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            autoComplete="cc-name"
                        />
                    </div>

                    <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                        <span className="text-sm font-medium">Save my card</span>
                        <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="h-5 w-10 cursor-pointer accent-primary"
                        />
                    </label>

                    {info && (
                        <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                            {info}
                        </p>
                    )}
                    {error && (
                        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-12 rounded-xl"
                            onClick={handleScanCard}
                        >
                            <Camera className="mr-2 size-4" />
                            Scan Card
                        </Button>
                        <Button
                            type="submit"
                            className="min-h-12 rounded-xl"
                            disabled={!canSubmit}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    {t('payment.adding')}
                                </>
                            ) : (
                                t('payment.add_card')
                            )}
                        </Button>
                    </div>

                    <DialogFooter className="gap-3 pt-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="min-h-10"
                            onClick={() => {
                                stopStream();
                                onCancel();
                            }}
                        >
                            {t('common.cancel')}
                        </Button>
                    </DialogFooter>
                </form>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-border bg-black">
                        <div className="relative aspect-[4/3] w-full">
                            <video
                                ref={videoRef}
                                className="absolute inset-0 h-full w-full object-cover opacity-90"
                                playsInline
                                muted
                            />
                            <div className="absolute inset-0 grid place-items-center">
                                <div className="h-[62%] w-[78%] rounded-xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-white/90">
                                Hold your card inside the frame.
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    <Button
                        type="button"
                        className="min-h-12 w-full rounded-xl"
                        onClick={handleScanUseManual}
                    >
                        {t('payment.add_card')}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="min-h-10 w-full"
                        onClick={goManual}
                    >
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}

async function postSetupIntent(): Promise<{
    ok: boolean;
    clientSecret: string | null;
    error: string | null;
    status: number;
}> {
    const csrfFromMeta =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';
    const csrfFromCookie = (() => {
        // Laravel sets XSRF-TOKEN (URL-encoded) which can be used as a fallback.
        const m = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
        if (!m) return '';
        try {
            return decodeURIComponent(m[1]);
        } catch {
            return '';
        }
    })();
    const csrf = csrfFromMeta || csrfFromCookie;

    if (!csrf) {
        return {
            ok: false,
            status: 419,
            clientSecret: null,
            error:
                'Missing CSRF token. If you are running locally, open the app via http://127.0.0.1:8000 (not the Vite 5173 URL).',
        };
    }

    const res = await fetch('/settings/payment/setup-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    });

    // If the route is behind auth/verified, Laravel may redirect to login/verification.
    if (res.redirected) {
        return {
            ok: false,
            status: res.status,
            clientSecret: null,
            error: `Request was redirected (${res.status}). Make sure you’re signed in and your email is verified, then try again.`,
        };
    }

    const text = await res.text();
    let data: unknown = null;
    try {
        data = text ? (JSON.parse(text) as unknown) : null;
    } catch {
        data = null;
    }

    const clientSecret =
        typeof (data as { clientSecret?: unknown } | null)?.clientSecret ===
        'string'
            ? (data as { clientSecret: string }).clientSecret
            : null;
    const apiError =
        typeof (data as { error?: unknown } | null)?.error === 'string'
            ? (data as { error: string }).error
            : null;

    return {
        ok: res.ok,
        status: res.status,
        clientSecret,
        error: apiError,
    };
}

export function CardVaultSection({
    title,
    description,
    stripePublishableKey,
    paymentMethods,
}: {
    title: string;
    description?: string;
    stripePublishableKey: string | null;
    paymentMethods: CardPaymentMethodItem[];
}) {
    const { t } = useTranslations();
    const stripePromise = useMemo(
        () =>
            stripePublishableKey
                ? (loadStripe(stripePublishableKey) as Promise<Stripe | null>)
                : null,
        [stripePublishableKey],
    );

    const canManageCards = !!stripePublishableKey;
    const [showAddCard, setShowAddCard] = useState(false);
    const [setupClientSecret, setSetupClientSecret] = useState<string | null>(
        null,
    );
    const [loadingSetup, setLoadingSetup] = useState(false);
    const [setupError, setSetupError] = useState<string | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePm, setDeletePm] = useState<CardPaymentMethodItem | null>(
        null,
    );
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [deleteResult, setDeleteResult] = useState<
        { ok: true; message: string } | { ok: false; message: string } | null
    >(null);

    const openAddCard = useCallback(async () => {
        setLoadingSetup(true);
        setSetupError(null);
        setSetupClientSecret(null);
        setShowAddCard(false);
        try {
            const result = await postSetupIntent();
            if (result.clientSecret) {
                setSetupClientSecret(result.clientSecret);
                setShowAddCard(true);
                return;
            }
            if (!result.ok) {
                setSetupError(
                    result.error ??
                        `Could not start add card (HTTP ${result.status}). Please try again.`,
                );
                setShowAddCard(true);
                return;
            }
            setSetupError(result.error ?? 'Could not start add card.');
            setShowAddCard(true);
        } catch {
            setSetupError('Could not start add card. Please try again.');
            setShowAddCard(true);
        } finally {
            setLoadingSetup(false);
        }
    }, []);

    const handleAddCardSuccess = useCallback(() => {
        setShowAddCard(false);
        setSetupClientSecret(null);
        setSetupError(null);
        router.visit('/settings/payment', { preserveScroll: true });
    }, []);

    const openDelete = useCallback((pm: CardPaymentMethodItem) => {
        setDeletePm(pm);
        setDeleteResult(null);
        setDeleteProcessing(false);
        setDeleteOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (!deletePm) return;
        setDeleteProcessing(true);
        setDeleteResult(null);

        router.delete(`/settings/payment/${encodeURIComponent(deletePm.id)}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteProcessing(false);
                setDeleteResult({ ok: true, message: 'Card removed successfully.' });
                router.visit(window.location.pathname, {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                });
            },
            onError: () => {
                setDeleteProcessing(false);
                setDeleteResult({
                    ok: false,
                    message: 'Could not remove card. Please try again.',
                });
            },
            onFinish: () => {
                setDeleteProcessing(false);
            },
        });
    }, [deletePm]);

    return (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {description ? (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    ) : null}
                </div>
                {canManageCards ? (
                    <Button
                        type="button"
                        onClick={openAddCard}
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
                ) : (
                    <Button type="button" asChild variant="outline">
                        <Link href="/settings/payment">{t('settings.payment')}</Link>
                    </Button>
                )}
            </div>

            {showAddCard ? (
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold">
                                {t('payment.add_card')}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('payment.add_card_description')}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setShowAddCard(false);
                                setSetupClientSecret(null);
                                setSetupError(null);
                            }}
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>

                    <div className="mt-4">
                        {loadingSetup ? (
                            <div className="flex min-h-24 items-center justify-center rounded-xl border border-border bg-muted/30">
                                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="size-4 animate-spin" />
                                    Loading…
                                </p>
                            </div>
                        ) : stripePromise && setupClientSecret ? (
                            <Elements stripe={stripePromise}>
                                <AddCardForm
                                    clientSecret={setupClientSecret}
                                    onSuccess={handleAddCardSuccess}
                                    onCancel={() => {
                                        setShowAddCard(false);
                                        setSetupClientSecret(null);
                                        setSetupError(null);
                                    }}
                                />
                            </Elements>
                        ) : (
                            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                {setupError ??
                                    'Could not load form. Please try again.'}
                            </p>
                        )}

                        {!stripePromise ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                                {t('payment.stripe_env_hint')}
                            </p>
                        ) : null}
                    </div>
                </div>
            ) : null}

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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => openDelete(pm)}
                                >
                                    {t('common.delete')}
                                </Button>
                                {!pm.is_default && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.post(
                                                '/settings/payment/default',
                                                {
                                                    payment_method_id: pm.id,
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

            <Dialog
                open={deleteOpen}
                onOpenChange={(open) => {
                    setDeleteOpen(open);
                    if (!open) {
                        setDeletePm(null);
                        setDeleteProcessing(false);
                        setDeleteResult(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove card</DialogTitle>
                        <DialogDescription>
                            {deletePm
                                ? `Remove ${deletePm.brand.toUpperCase()} •••• ${deletePm.last4}?`
                                : 'Remove this card?'}
                        </DialogDescription>
                    </DialogHeader>

                    {deleteResult ? (
                        <p
                            className={`rounded-md p-3 text-sm ${
                                deleteResult.ok
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                    : 'bg-destructive/10 text-destructive'
                            }`}
                        >
                            {deleteResult.message}
                        </p>
                    ) : null}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleteProcessing}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteProcessing || !!deleteResult?.ok}
                        >
                            {deleteProcessing ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Removing…
                                </>
                            ) : (
                                'Remove'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

