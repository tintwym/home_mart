import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import {
    CardVaultSection,
    type CardPaymentMethodItem,
} from '@/components/payments/card-vault-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

export default function Profile({
    mustVerifyEmail,
    status,
    paymentMethods = [],
    stripePublishableKey = null,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    paymentMethods?: CardPaymentMethodItem[];
    stripePublishableKey?: string | null;
}) {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslations();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('profile.page_title'),
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('profile.page_title')} />

            <h1 className="sr-only">{t('profile.page_title')}</h1>

            <SettingsLayout mobilePageTitle={t('settings.profile')}>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t('settings.profile_details')}
                        description={t('settings.profile_description')}
                    />

                    <CardVaultSection
                        title={t('settings.payment')}
                        description={t('settings.payment_description')}
                        stripePublishableKey={stripePublishableKey}
                        paymentMethods={paymentMethods}
                    />

                    <Form
                        action={ProfileController.update.url()}
                        method="patch"
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        {t('profile.name_label')}
                                    </Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.name ?? ''}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder={t('profile.name')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('profile.email')}
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.email ?? ''}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder={t('profile.email')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        {t('profile.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.phone ?? ''}
                                        name="phone"
                                        autoComplete="tel"
                                        placeholder={t('profile.phone')}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.phone}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">
                                        {t('profile.address')}
                                    </Label>
                                    <Input
                                        id="address"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user?.address ?? ''}
                                        name="address"
                                        autoComplete="street-address"
                                        placeholder={t('profile.address')}
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.address}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="region">
                                        {t('profile.region_label')}
                                    </Label>
                                    <select
                                        id="region"
                                        name="region"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                        defaultValue={auth.user?.region ?? ''}
                                        aria-describedby={
                                            errors.region
                                                ? 'region-error'
                                                : undefined
                                        }
                                    >
                                        <option value="">
                                            {t('profile.region_placeholder')}
                                        </option>
                                        <option value="SG">
                                            {t('profile.region_sg')}
                                        </option>
                                        <option value="MM">
                                            {t('profile.region_mm')}
                                        </option>
                                        <option value="US">
                                            {t('profile.region_us')}
                                        </option>
                                    </select>
                                    <InputError
                                        id="region-error"
                                        className="mt-2"
                                        message={errors.region}
                                    />
                                </div>

                                <input
                                    type="hidden"
                                    name="seller_type"
                                    value="individual"
                                />

                                {mustVerifyEmail &&
                                    auth.user?.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                {t('profile.email_unverified')}{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    {t(
                                                        'profile.resend_verification',
                                                    )}
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    {t(
                                                        'profile.verification_sent',
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        {t('common.save')}
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            {t('profile.saved')}
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
