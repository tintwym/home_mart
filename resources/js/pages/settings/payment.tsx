import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import {
    CardVaultSection,
    type CardPaymentMethodItem,
} from '@/components/payments/card-vault-section';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { router } from '@inertiajs/react';

type Props = {
    region?: string;
    paymentMethods: CardPaymentMethodItem[];
    localPaymentMethods?: {
        id: string;
        type: string;
        type_label: string;
        identifier: string;
        is_default: boolean;
    }[];
    stripePublishableKey: string | null;
};

export default function PaymentSettings({
    region = '',
    paymentMethods = [],
    localPaymentMethods = [],
    stripePublishableKey,
}: Props) {
    const { t } = useTranslations();
    const isMyanmar = region === 'MM';
    const canManageCards = !isMyanmar && !!stripePublishableKey;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.payment'),
            href: '/settings/payment',
        },
    ];
    const pageProps = usePage<SharedData>().props as Record<string, unknown>;
    const flash = pageProps.flash as
        | { status?: string; error?: string }
        | undefined;

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

                {isMyanmar && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold">
                                    {t('payment.myanmar_heading')}
                                </h2>
                                <button
                                    type="button"
                                    className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                                    onClick={() => {
                                        const el =
                                            document.getElementById(
                                                'mm-add-payment',
                                            );
                                        el?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        });
                                    }}
                                >
                                    {t('common.add')}
                                </button>
                            </div>

                            {localPaymentMethods.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {t('payment.no_methods')}
                                </p>
                            ) : (
                                <div className="divide-y divide-border rounded-lg border border-border">
                                    {localPaymentMethods.map((pm) => (
                                        <div
                                            key={pm.id}
                                            className="flex flex-wrap items-center gap-3 px-4 py-4 sm:flex-nowrap"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">
                                                    {pm.type_label}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {pm.identifier}
                                                </p>
                                            </div>
                                            {pm.is_default ? (
                                                <span className="ml-auto rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                    {t('payment.default')}
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="ml-auto rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted/50"
                                                    onClick={() => {
                                                        router.post(
                                                            '/settings/payment/local/default',
                                                            {
                                                                local_payment_method_id:
                                                                    pm.id,
                                                            },
                                                        );
                                                    }}
                                                >
                                                    {t('payment.set_default')}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    router.delete(
                                                        `/settings/payment/local/${encodeURIComponent(
                                                            pm.id,
                                                        )}`,
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }}
                                            >
                                                {t('common.delete')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                id="mm-add-payment"
                                className="mt-4 rounded-lg border border-border bg-muted/20 p-4"
                            >
                                <h3 className="mb-2 text-sm font-semibold">
                                    {t('payment.add_myanmar')}
                                </h3>
                                <form
                                    className="grid gap-3 sm:grid-cols-[1fr,1fr,auto]"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const fd = new FormData(form);
                                        const payload = Object.fromEntries(fd);
                                        router.post(
                                            '/settings/payment',
                                            payload,
                                            { preserveScroll: true },
                                        );
                                    }}
                                >
                                    <select
                                        name="type"
                                        className="min-h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        defaultValue="mpu"
                                    >
                                        <option value="mpu">
                                            MPU Debit Card
                                        </option>
                                        <option value="kbz_pay">KBZ Pay</option>
                                        <option value="aya_pay">AYA Pay</option>
                                        <option value="wave_pay">
                                            Wave Pay
                                        </option>
                                        <option value="cb_pay">CB Pay</option>
                                    </select>
                                    <input
                                        name="identifier"
                                        className="min-h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        placeholder="e.g. last 4 digits or phone number"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="min-h-10 rounded-md bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600"
                                    >
                                        {t('payment.add')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {!canManageCards && !isMyanmar ? (
                    <div className="rounded-lg border border-border bg-card p-4">
                        <p className="text-sm text-muted-foreground">
                            {t('payment.stripe_env_hint')}
                        </p>
                    </div>
                ) : null}

                {canManageCards ? (
                    <CardVaultSection
                        title={t('payment.credit_debit_card')}
                        stripePublishableKey={stripePublishableKey}
                        paymentMethods={paymentMethods}
                    />
                ) : null}
            </SettingsLayout>
        </AppLayout>
    );
}
