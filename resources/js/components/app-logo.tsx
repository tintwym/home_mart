import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                <AppLogoIcon className="size-full" />
            </div>
            <div className="ml-1 grid hidden flex-1 text-left text-sm sm:grid">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {name}
                </span>
            </div>
        </>
    );
}
