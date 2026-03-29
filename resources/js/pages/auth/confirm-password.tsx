import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslations } from '@/hooks/use-translations';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useTranslations();

    return (
        <AuthLayout
            title={t('confirm_password.title')}
            description={t('confirm_password.description')}
        >
            <Head title={t('confirm_password.title')} />

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
            >
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {t('confirm_password.password')}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder={t('confirm_password.password')}
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                {t('confirm_password.button')}
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}
