import { Form, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    browserSupportsWebAuthn,
    startAuthentication,
} from '@/lib/passkeys-client';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    passkeyError?: string | null;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    passkeyError,
    canResetPassword,
    canRegister,
}: Props) {
    const [passkeyLoading, setPasskeyLoading] = useState(false);

    const loginWithPasskey = async () => {
        setPasskeyLoading(true);
        try {
            const res = await fetch('/passkeys/authentication-options', {
                credentials: 'same-origin',
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) {
                throw new Error('Failed to load passkey options');
            }
            const optionsJSON = await res.json();
            const credential = await startAuthentication({ optionsJSON });
            router.post(
                '/passkeys/authenticate',
                {
                    start_authentication_response: JSON.stringify(credential),
                },
                {
                    onFinish: () => setPasskeyLoading(false),
                },
            );
        } catch {
            setPasskeyLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                action={store.url()}
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>

                            {browserSupportsWebAuthn() ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    disabled={processing || passkeyLoading}
                                    onClick={() => void loginWithPasskey()}
                                >
                                    {passkeyLoading && <Spinner />}
                                    Sign in with passkey
                                </Button>
                            ) : null}
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            {passkeyError ? (
                <div className="mb-4 text-center text-sm font-medium text-destructive">
                    {passkeyError}
                </div>
            ) : null}
        </AuthLayout>
    );
}
