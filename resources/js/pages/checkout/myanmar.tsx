import { Head, router } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Building2,
    CreditCard,
    Landmark,
    Smartphone,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';

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

const METHOD_ICON: Record<MethodKey, React.ComponentType<{ className?: string }>> =
    {
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
    const [method, setMethod] = useState<MethodKey>(() => {
        const def = savedMethods.find((m) => m.is_default);
        if (!def) return 'kbz_pay';
        const key = def.type as MethodKey;
        return (['kbz_pay', 'wave_pay', 'aya_pay', 'cb_pay', 'mpu'].includes(key)
            ? key
            : 'kbz_pay') as MethodKey;
    });
    const [identifier, setIdentifier] = useState(() => {
        const def = savedMethods.find((m) => m.is_default);
        return def?.identifier ?? '';
    });
    const [saveMethod, setSaveMethod] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [showQr, setShowQr] = useState(true);

    const defaultSavedForType = useMemo(() => {
        const list = savedMethods.filter((m) => m.type === method);
        const def = list.find((m) => m.is_default) ?? list[0];
        return def ?? null;
    }, [savedMethods, method]);

    const onSubmit = () => {
        setProcessing(true);
        router.post(
            '/checkout/mm/pay',
            {
                order_id: order.id,
                method,
                identifier: identifier.trim(),
                save_method: saveMethod,
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
            <div className="mx-auto max-w-5xl px-0 pt-6 pb-8 sm:px-2">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,520px),minmax(0,1fr)] lg:items-start">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <h1 className="text-2xl font-bold">Checkout</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Choose how you’d like to pay.
                        </p>

                        <div className="mt-6 space-y-4">
                            <h2 className="font-semibold">Payment method</h2>

                            <div className="space-y-2">
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
                                        <div
                                            key={key}
                                            className="rounded-xl border border-border bg-background"
                                        >
                                            <button
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
                                                            (m) =>
                                                                m.type === key,
                                                        );
                                                    setIdentifier(
                                                        def?.identifier ?? '',
                                                    );
                                                }}
                                                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-muted/30 ${
                                                    active
                                                        ? 'ring-2 ring-emerald-600/15'
                                                        : ''
                                                }`}
                                            >
                                                <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
                                                    <Icon className="size-5" />
                                                </span>
                                                <span className="flex-1">
                                                    <span className="block text-sm font-semibold">
                                                        {METHOD_LABELS[key]}
                                                    </span>
                                                </span>
                                                <span
                                                    className={`h-5 w-5 rounded-full border ${
                                                        active
                                                            ? 'border-emerald-600 bg-emerald-600'
                                                            : 'border-border'
                                                    }`}
                                                >
                                                    {active ? (
                                                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
                                                            ✓
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </button>

                                            {active ? (
                                                <div className="border-t border-border p-4">
                                                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-muted-foreground">
                                                                Total amount
                                                            </span>
                                                            <span className="text-lg font-bold">
                                                                {formatPrice(
                                                                    order.total,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 space-y-3">
                                                        <label className="text-sm font-medium">
                                                            {METHOD_HINT[key] ??
                                                                'Details'}
                                                        </label>
                                                        <Input
                                                            value={identifier}
                                                            onChange={(e) =>
                                                                setIdentifier(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder={
                                                                key === 'mpu'
                                                                    ? '1234'
                                                                    : key ===
                                                                        'bank'
                                                                      ? 'Optional'
                                                                      : '09 xxx xxx xxx'
                                                            }
                                                            inputMode={
                                                                key === 'mpu'
                                                                    ? 'numeric'
                                                                    : 'tel'
                                                            }
                                                        />

                                                        {QR_METHODS.includes(
                                                            key,
                                                        ) &&
                                                        identifier.trim() !==
                                                            '' ? (
                                                            <div className="rounded-xl border border-border bg-muted/20 p-4">
                                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                                    <p className="text-sm font-semibold">
                                                                        QR code
                                                                    </p>
                                                                    <button
                                                                        type="button"
                                                                        className="text-sm font-medium text-primary underline underline-offset-4"
                                                                        onClick={() =>
                                                                            setShowQr(
                                                                                (v) =>
                                                                                    !v,
                                                                            )
                                                                        }
                                                                    >
                                                                        {showQr
                                                                            ? 'Hide'
                                                                            : 'Show'}
                                                                    </button>
                                                                </div>
                                                                {showQr ? (
                                                                    <div className="grid place-items-center">
                                                                        <img
                                                                            src={
                                                                                qrUrl
                                                                            }
                                                                            alt="Payment QR code"
                                                                            className="h-[240px] w-[240px] rounded-lg bg-white p-2"
                                                                            loading="lazy"
                                                                        />
                                                                        <p className="mt-3 text-center text-xs text-muted-foreground">
                                                                            Scan
                                                                            this
                                                                            QR
                                                                            in{' '}
                                                                            {
                                                                                METHOD_LABELS[
                                                                                    key
                                                                                ]
                                                                            }{' '}
                                                                            to
                                                                            pay.
                                                                        </p>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        ) : null}

                                                        {defaultSavedForType ? (
                                                            <p className="text-xs text-muted-foreground">
                                                                Saved:{' '}
                                                                {
                                                                    defaultSavedForType.identifier
                                                                }
                                                            </p>
                                                        ) : null}

                                                        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3">
                                                            <span className="text-sm font-medium">
                                                                Save this
                                                                method
                                                            </span>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    saveMethod
                                                                }
                                                                onChange={(e) =>
                                                                    setSaveMethod(
                                                                        e.target
                                                                            .checked,
                                                                    )
                                                                }
                                                                className="h-5 w-10 cursor-pointer accent-primary"
                                                            />
                                                        </label>

                                                        <Button
                                                            type="button"
                                                            className="min-h-12 w-full rounded-xl"
                                                            disabled={
                                                                processing
                                                            }
                                                            onClick={onSubmit}
                                                        >
                                                            {processing
                                                                ? 'Processing…'
                                                                : `Pay with ${METHOD_LABELS[key]}`}
                                                        </Button>

                                                        <p className="mt-2 text-center text-xs text-muted-foreground">
                                                            Payments are
                                                            encrypted and
                                                            secure
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/30 p-6">
                        <h2 className="mb-4 font-semibold">Order Summary</h2>
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
                </div>
            </div>
        </AppLayout>
    );
}

