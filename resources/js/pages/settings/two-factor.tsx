import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import AppTwoFactorController from '@/actions/App/Http/Controllers/Settings/TwoFactorAuthenticationController';
import FortifyTwoFactorController from '@/actions/Laravel/Fortify/Http/Controllers/TwoFactorAuthenticationController';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const { t } = useTranslations();
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('twofa.page_title'),
            href: AppTwoFactorController.show.url(),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('twofa.page_title')} />

            <h1 className="sr-only">{t('twofa.page_title')}</h1>

            <SettingsLayout mobilePageTitle={t('settings.two_factor')}>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t('twofa.heading')}
                        description={t('twofa.description')}
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="default">
                                {t('twofa.enabled')}
                            </Badge>
                            <p className="text-muted-foreground">
                                {t('twofa.enabled_description')}
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="relative inline">
                                <Form
                                    action={FortifyTwoFactorController.destroy.url()}
                                    method="delete"
                                >
                                    {({ processing }) => (
                                        <Button
                                            variant="destructive"
                                            type="submit"
                                            disabled={processing}
                                        >
                                            <ShieldBan />{' '}
                                            {t('twofa.disable_button')}
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge variant="destructive">
                                {t('twofa.disabled')}
                            </Badge>
                            <p className="text-muted-foreground">
                                {t('twofa.disabled_description')}
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                    >
                                        <ShieldCheck />
                                        {t('twofa.continue_setup')}
                                    </Button>
                                ) : (
                                    <Form
                                        action={FortifyTwoFactorController.store.url()}
                                        method="post"
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                <ShieldCheck />
                                                {t('twofa.enable_button')}
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
