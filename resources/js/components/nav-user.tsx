import { Link, usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { login, register } from '@/routes';
import type { SharedData } from '@/types';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const mobileNavCleanup = useMobileNavigation();
    const [sidebarLogoutOpen, setSidebarLogoutOpen] = useState(false);

    if (!auth.user) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <Link href={login()}>Log in</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" asChild>
                        <Link href={register()}>Register</Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                            data-test="sidebar-menu-button"
                        >
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent
                            user={auth.user}
                            onOpenLogout={() => setSidebarLogoutOpen(true)}
                        />
                    </DropdownMenuContent>
                </DropdownMenu>
                <LogoutConfirmDialog
                    open={sidebarLogoutOpen}
                    onOpenChange={setSidebarLogoutOpen}
                    onLogout={mobileNavCleanup}
                />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
