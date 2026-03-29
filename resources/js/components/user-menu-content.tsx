import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslations } from '@/hooks/use-translations';
import { index as settingsIndex } from '@/routes/settings';
import type { User } from '@/types';

type Props = {
    user: User;
    onOpenLogout: () => void;
};

export function UserMenuContent({ user, onOpenLogout }: Props) {
    const cleanup = useMobileNavigation();
    const { t } = useTranslations();

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={settingsIndex()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('nav.settings')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button
                    type="button"
                    className="flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={onOpenLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    {t('nav.log_out')}
                </button>
            </DropdownMenuItem>
        </>
    );
}
