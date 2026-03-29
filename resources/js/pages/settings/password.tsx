import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

export default function Password() {
    const { t } = useTranslations();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('password.page_title'),
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('password.page_title')} />

            <h1 className="sr-only">{t('password.page_title')}</h1>

            <SettingsLayout mobilePageTitle={t('settings.password')}>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t('password.update_title')}
                        description={t('password.update_description')}
                    />

                    <Form
                        action={PasswordController.update.url()}
                        method="put"
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-6"
                    >
                        {({ errors, processing, recentlySuccessful }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="current_password">
                                        {t('password.current')}
                                    </Label>

                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder={t('password.current')}
                                    />

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t('password.new')}
                                    </Label>

                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder={t('password.new')}
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        {t('password.confirm')}
                                    </Label>

                                    <Input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder={t('password.confirm')}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-password-button"
                                    >
                                        {t('password.save')}
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
            </SettingsLayout>
        </AppLayout>
    );
}
