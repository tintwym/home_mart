import { Head, router, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Building2,
    CreditCard,
    Home,
    Landmark,
    Smartphone,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';
import type { SharedData } from '@/types';

type SavedMethod = {
    id: string;
    type: string;
    type_label: string;
    identifier: string;
    is_default: boolean;
};

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

type MethodKey = 'kbz_pay' | 'wave_pay' | 'aya_pay' | 'cb_pay' | 'mpu' | 'bank';

const METHOD_LABELS: Record<MethodKey, string> = {
    kbz_pay: 'KBZPay',
    wave_pay: 'Wave Money',
    aya_pay: 'AYA Pay',
    cb_pay: 'CB Pay',
    mpu: 'MPU Card',
    bank: 'Bank transfer',
};

const METHOD_HINT: Partial<Record<MethodKey, string>> = {
    kbz_pay: 'KBZPay phone number',
    wave_pay: 'Wave phone number',
    aya_pay: 'AYA Pay phone number',
    cb_pay: 'CB Pay phone number',
    mpu: 'MPU card last 4 digits',
    bank: 'Reference / note (optional)',
};

const METHOD_ICON: Record<
    MethodKey,
    React.ComponentType<{ className?: string }>
> = {
    kbz_pay: Wallet,
    wave_pay: Smartphone,
    aya_pay: BadgeDollarSign,
    cb_pay: CreditCard,
    mpu: Building2,
    bank: Landmark,
};

const QR_METHODS: MethodKey[] = ['kbz_pay', 'wave_pay', 'aya_pay', 'cb_pay'];

export default function CheckoutMyanmar({
    order,
    savedMethods = [],
}: {
    order: Order;
    savedMethods?: SavedMethod[];
}) {
    const { formatPrice } = useCurrency();
    const { auth } = usePage<SharedData>().props;
    const [email, setEmail] = useState(() => auth.user?.email ?? '');
    const [method, setMethod] = useState<MethodKey>(() => {
        const def = savedMethods.find((m) => m.is_default);
        if (!def) return 'kbz_pay';
        const key = def.type as MethodKey;
        return (
            ['kbz_pay', 'wave_pay', 'aya_pay', 'cb_pay', 'mpu'].includes(key)
                ? key
                : 'kbz_pay'
        ) as MethodKey;
    });
    const [identifier, setIdentifier] = useState(() => {
        const def = savedMethods.find((m) => m.is_default);
        return def?.identifier ?? '';
    });
    const [processing, setProcessing] = useState(false);
    const [showQr, setShowQr] = useState(true);

    const onSubmit = () => {
        setProcessing(true);
        router.post(
            '/checkout/mm/pay',
            {
                order_id: order.id,
                method,
                identifier: identifier.trim(),
                save_method: true,
                email: email.trim(),
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const qrPayload = useMemo(() => {
        return JSON.stringify({
            app: 'homemart',
            order_id: order.id,
            method,
            amount: order.total,
            identifier: identifier.trim() || undefined,
            currency: 'MMK',
        });
    }, [order.id, order.total, method, identifier]);

    const qrUrl = useMemo(() => {
        // Lightweight QR rendering without adding dependencies.
        // You can swap this to a first-party QR generator later.
        return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
            qrPayload,
        )}`;
    }, [qrPayload]);

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Checkout – Myanmar" />
            <div className="mx-auto max-w-3xl px-0 pt-6 pb-8 sm:px-2">
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between gap-4 border-b border-border p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                <Home className="size-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-base leading-tight font-semibold">
                                    Myanmar Store
                                </p>
                                <p className="text-sm leading-tight text-muted-foreground">
                                    Secure checkout
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                Total due
                            </p>
                            <p className="text-xl font-bold">
                                {formatPrice(order.total)}
                            </p>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                inputMode="email"
                                autoComplete="email"
                            />
                        </div>

                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-sm text-muted-foreground">
                                pay with
                            </span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <h2 className="text-base font-semibold">
                            Mobile wallets &amp; cards
                        </h2>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {(
                                [
                                    'kbz_pay',
                                    'wave_pay',
                                    'aya_pay',
                                    'cb_pay',
                                    'mpu',
                                    'bank',
                                ] as MethodKey[]
                            ).map((key) => {
                                const active = method === key;
                                const Icon = METHOD_ICON[key];
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            setMethod(key);
                                            const def =
                                                savedMethods.find(
                                                    (m) =>
                                                        m.is_default &&
                                                        m.type === key,
                                                ) ??
                                                savedMethods.find(
                                                    (m) => m.type === key,
                                                );
                                            setIdentifier(
                                                def?.identifier ?? '',
                                            );
                                        }}
                                        className={`relative rounded-2xl border p-4 text-left transition ${
                                            active
                                                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 dark:bg-indigo-950/20'
                                                : 'border-border hover:bg-muted/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground">
                                                <Icon className="size-5" />
                                            </span>
                                            {active ? (
                                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                                    ✓
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="mt-3 text-sm font-semibold">
                                            {METHOD_LABELS[key]}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-medium">
                                {METHOD_HINT[method] ?? 'Details'}
                            </label>
                            <Input
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={
                                    method === 'mpu'
                                        ? '1234'
                                        : method === 'bank'
                                          ? 'Optional'
                                          : '09 xxx xxx xxx'
                                }
                                inputMode={method === 'mpu' ? 'numeric' : 'tel'}
                            />
                        </div>

                        {QR_METHODS.includes(method) &&
                        identifier.trim() !== '' ? (
                            <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">
                                        QR code
                                    </p>
                                    <button
                                        type="button"
                                        className="text-sm font-medium text-primary underline underline-offset-4"
                                        onClick={() => setShowQr((v) => !v)}
                                    >
                                        {showQr ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                                {showQr ? (
                                    <div className="grid place-items-center">
                                        <img
                                            src={qrUrl}
                                            alt="Payment QR code"
                                            className="h-[240px] w-[240px] rounded-lg bg-white p-2"
                                            loading="lazy"
                                        />
                                        <p className="mt-3 text-center text-xs text-muted-foreground">
                                            Scan this QR in{' '}
                                            {METHOD_LABELS[method]} to pay.
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="mt-5">
                            <Button
                                type="button"
                                className="min-h-12 w-full rounded-xl"
                                disabled={processing}
                                onClick={onSubmit}
                            >
                                {processing
                                    ? 'Processing…'
                                    : `Pay ${formatPrice(order.total)}`}
                            </Button>
                        </div>

                        <p className="mt-3 text-center text-xs text-muted-foreground">
                            Secure checkout
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
