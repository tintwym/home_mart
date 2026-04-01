import { Link, usePage, router } from '@inertiajs/react';
import {
    LogOut,
    Menu,
    MessageCircle,
    Search,
    Settings,
    ShoppingCart,
    User,
} from 'lucide-react';
import { ChevronDown, Layers } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import { LogoutConfirmDialog } from '@/components/logout-confirm-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslations } from '@/hooks/use-translations';
import { toUrl } from '@/lib/utils';
import { dashboard, login, register } from '@/routes';
import { index as settingsIndex } from '@/routes/settings';
import type { BreadcrumbItem, NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [];

const rightNavItems: NavItem[] = [];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<SharedData>();
    const { t, categoryName } = useTranslations();
    const [sidebarLogoutOpen, setSidebarLogoutOpen] = useState(false);
    const { auth, categories = [] } = page.props;
    const searchQuery =
        (page.props as { searchQuery?: string }).searchQuery ?? '';
    const currentLocation = (() => {
        try {
            return (
                new URL(page.url, window?.location?.origin).searchParams.get(
                    'location',
                ) ?? null
            );
        } catch {
            return null;
        }
    })();
    const getInitials = useInitials();
    const mobileNavCleanup = useMobileNavigation();
    const [headerLogoutOpen, setHeaderLogoutOpen] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    // From iPad mini (md) up: don't show the side drawer
    useEffect(() => {
        const closeIfMdOrUp = () => {
            if (window.matchMedia('(min-width: 768px)').matches) {
                setSheetOpen(false);
            }
        };
        closeIfMdOrUp();
        window.addEventListener('resize', closeIfMdOrUp);
        return () => window.removeEventListener('resize', closeIfMdOrUp);
    }, []);

    const currentPath = (() => {
        try {
            return new URL(page.url, window?.location?.origin).pathname ?? '';
        } catch {
            return '';
        }
    })();
    const searchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const q =
            (
                form.elements.namedItem('q') as HTMLInputElement | null
            )?.value?.trim() ?? '';
        const searchParams = new URLSearchParams();
        if (q) searchParams.set('q', q);
        if (currentLocation) searchParams.set('location', currentLocation);
        const queryString = searchParams.toString();
        router.get(
            queryString ? `/?${queryString}` : '/',
            {},
            { preserveState: false },
        );
    };

    return (
        <>
            <div
                className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-background pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
                style={{
                    paddingTop: 'env(safe-area-inset-top)',
                    paddingBottom: 0,
                }}
            >
                {/* Row 1: Logo left, search center, icons right — from iPad mini (md) up same as desktop */}
                <div className="mx-auto flex h-12 min-h-[3rem] flex-nowrap items-center gap-1.5 px-2 sm:flex-wrap sm:gap-2 sm:px-4 md:h-14 md:min-h-[3.5rem] md:max-w-7xl md:gap-4 md:px-6">
                    {/* Left: hamburger (mobile), logo */}
                    <div className="flex shrink-0 items-center gap-1.5 md:gap-4">
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex h-9 min-h-[36px] w-9 min-w-[36px] touch-manipulation sm:h-10 sm:min-h-[40px] sm:w-10 sm:min-w-[40px]"
                                aria-label={t('nav.open_menu')}
                                onClick={() => setSheetOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                        <Link
                            href={dashboard()}
                            prefetch
                            className="hidden shrink-0 items-center space-x-2 sm:flex"
                        >
                            <AppLogo />
                        </Link>
                    </div>

                    {/* Center: search bar — grows with row; cap widens on larger breakpoints */}
                    <div className="flex min-w-0 flex-[2] basis-0 justify-center md:min-w-0 md:flex-1 md:basis-0 md:justify-center md:px-3 lg:px-4">
                        <form
                            onSubmit={searchFormSubmit}
                            className="w-full max-w-full min-w-0 md:max-w-3xl lg:max-w-4xl"
                        >
                            <div className="relative flex min-w-0 items-center overflow-hidden rounded-lg border border-input bg-background">
                                <input
                                    type="search"
                                    name="q"
                                    defaultValue={searchQuery}
                                    placeholder={t('search.placeholder')}
                                    className="min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-10 pl-3 text-sm outline-none placeholder:text-muted-foreground md:pr-10 md:pl-4"
                                    aria-label={t('search.aria')}
                                />
                                <button
                                    type="submit"
                                    className="absolute top-0 right-0 flex h-full min-h-[44px] w-10 items-center justify-center bg-transparent text-muted-foreground transition-colors hover:text-foreground md:h-9 md:min-h-0 md:w-10"
                                    aria-label={t('search.button')}
                                >
                                    <Search className="size-5 shrink-0" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: language (desktop only), chat, cart, profile */}
                    <div className="flex shrink-0 items-center gap-1 md:gap-2">
                        <div className="relative flex items-center space-x-1">
                            <div className="hidden md:block">
                                <LanguageSwitcher />
                            </div>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="group flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer touch-manipulation sm:h-9 sm:w-9 md:h-9 md:w-9"
                                            aria-label="Chat"
                                            asChild
                                        >
                                            <Link
                                                href="/chat"
                                                className="relative"
                                            >
                                                <MessageCircle className="!size-5 opacity-80 group-hover:opacity-100" />
                                                {(auth?.chatUnreadCount ?? 0) >
                                                    0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                                        {(auth?.chatUnreadCount ??
                                                            0) > 99
                                                            ? '99+'
                                                            : auth?.chatUnreadCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('nav.chat')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="group relative flex h-11 min-h-[44px] w-11 min-w-[44px] cursor-pointer touch-manipulation sm:h-9 sm:w-9 md:h-9 md:w-9"
                                            aria-label="Cart"
                                            asChild
                                        >
                                            <Link href="/cart">
                                                <ShoppingCart className="!size-5 opacity-80 group-hover:opacity-100" />
                                                {(auth?.cartCount ?? 0) > 0 && (
                                                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                                        {(auth?.cartCount ??
                                                            0) > 99
                                                            ? '99+'
                                                            : auth?.cartCount}
                                                    </span>
                                                )}
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{t('nav.cart')}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="ml-1 hidden gap-1 md:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider
                                        key={item.title}
                                        delayDuration={0}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.icon && (
                                                        <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                                    )}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        <div>
                            {auth?.user ? (
                                <>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="flex size-10 min-h-[44px] min-w-[44px] touch-manipulation rounded-full p-0.5 sm:size-9 sm:min-h-9 sm:min-w-9"
                                                aria-label={t('nav.user_menu')}
                                            >
                                                <Avatar className="size-8 overflow-hidden rounded-full sm:size-8">
                                                    <AvatarImage
                                                        src={auth.user.avatar}
                                                        alt={auth.user.name}
                                                    />
                                                    <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                        {getInitials(
                                                            auth.user.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-56"
                                            align="end"
                                        >
                                            <UserMenuContent
                                                user={auth.user}
                                                onOpenLogout={() =>
                                                    setHeaderLogoutOpen(true)
                                                }
                                            />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <LogoutConfirmDialog
                                        open={headerLogoutOpen}
                                        onOpenChange={setHeaderLogoutOpen}
                                        onLogout={mobileNavCleanup}
                                    />
                                </>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex h-11 min-h-[44px] touch-manipulation items-center gap-1.5 rounded-full px-2 pr-2.5 sm:h-9 sm:px-1.5 sm:pr-2"
                                            aria-label={t('nav.user_menu')}
                                        >
                                            <Avatar className="size-8 overflow-hidden rounded-full sm:size-8">
                                                <AvatarFallback className="rounded-full bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                    <User className="size-4 opacity-80" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <ChevronDown className="size-4 opacity-70" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56"
                                        align="end"
                                    >
                                        <DropdownMenuLabel>
                                            {t('nav.account_and_lists')}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="block w-full cursor-pointer"
                                                    href={login()}
                                                    prefetch
                                                >
                                                    {t('nav.log_in')}
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="block w-full cursor-pointer"
                                                    href={register()}
                                                    prefetch
                                                >
                                                    {t('nav.register')}
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Category bar — hidden on mobile; from iPad mini (md) up same as desktop (scrollable row) */}
                <div className="hidden border-t border-border/60 bg-muted/30 md:block">
                    <div className="mx-auto max-w-7xl px-6 py-2 [scrollbar-width:none] md:overflow-x-auto [&::-webkit-scrollbar]:hidden">
                        <div className="flex min-w-0 items-center justify-start gap-2 text-sm md:min-w-max md:flex-nowrap md:pr-4">
                            {/* All: link to home, no icon, no highlight color */}
                            <Link
                                href="/"
                                className="flex shrink-0 items-center rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                {t('nav.all')}
                            </Link>
                            <nav className="flex shrink-0 items-center gap-2 md:flex-nowrap">
                                {categories.slice(0, 10).map((cat) => {
                                    const isActive =
                                        currentPath ===
                                        `/categories/${cat.slug}`;
                                    return (
                                        <Link
                                            key={cat.id}
                                            href={`/categories/${cat.slug}`}
                                            className={`rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground ${
                                                isActive
                                                    ? 'bg-primary font-medium text-primary-foreground'
                                                    : 'text-muted-foreground hover:text-accent-foreground'
                                            }`}
                                        >
                                            {categoryName(cat)}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shared sheet (mobile hamburger + row 3 "All") */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent
                    side="left"
                    className="flex h-full w-[min(20rem,85vw)] flex-col items-stretch justify-between bg-sidebar pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] md:w-[min(22rem,85vw)]"
                >
                    <SheetTitle className="sr-only">
                        {t('nav.navigation_menu')}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        {t('nav.menu_sheet_description')}
                    </SheetDescription>
                    <SheetHeader className="flex justify-start text-left">
                        <Link
                            href={dashboard()}
                            prefetch
                            onClick={() => setSheetOpen(false)}
                            className="flex items-center gap-3 rounded-md py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                <AppLogoIcon className="size-full object-contain p-1.5" />
                            </div>
                            <div className="flex min-w-0 flex-col text-left">
                                <span className="text-lg leading-tight font-bold text-foreground">
                                    Home Mart
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {t('nav.tagline')}
                                </span>
                            </div>
                        </Link>
                    </SheetHeader>
                    <div className="flex h-full flex-1 flex-col p-4">
                        <div className="flex flex-1 flex-col gap-1 text-sm">
                            {categories.length > 0 && (
                                <Collapsible
                                    defaultOpen={false}
                                    className="group/cat"
                                >
                                    <CollapsibleTrigger className="flex min-h-[44px] w-full touch-manipulation items-center justify-between rounded-md px-2 py-2 font-semibold text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                                        <span className="flex items-center gap-2">
                                            <Layers className="h-4 w-4" />
                                            {t('nav.categories')}
                                        </span>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/cat:rotate-180" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <ul className="ml-2 flex flex-col gap-0.5 border-l border-sidebar-border py-2 pl-4">
                                            {categories.map((cat) => (
                                                <li key={cat.id}>
                                                    <Link
                                                        href={`/categories/${cat.slug}`}
                                                        className="block min-h-[44px] py-2.5 font-medium hover:underline active:opacity-80"
                                                    >
                                                        {categoryName(cat)}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-2 font-medium hover:bg-sidebar-accent"
                                >
                                    {item.icon && (
                                        <item.icon className="h-5 w-5" />
                                    )}
                                    <span>{item.title}</span>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-auto flex flex-col gap-0.5 border-t border-sidebar-border pt-2">
                            <div className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 md:hidden">
                                <span className="text-muted-foreground">
                                    {t('nav.language')}
                                </span>
                                <LanguageSwitcher />
                            </div>
                            <Link
                                href="/download"
                                onClick={() => setSheetOpen(false)}
                                className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent md:hidden"
                            >
                                {t('nav.download_app')}
                            </Link>
                            {rightNavItems.map((item) => (
                                <a
                                    key={item.title}
                                    href={toUrl(item.href)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium"
                                >
                                    {item.icon && (
                                        <item.icon className="h-5 w-5" />
                                    )}
                                    <span>{item.title}</span>
                                </a>
                            ))}
                            {auth?.user ? (
                                <>
                                    <div className="flex min-h-[44px] items-center gap-3 rounded-md px-2 py-1.5">
                                        <Avatar className="size-9 shrink-0 overflow-hidden rounded-full">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate text-sm font-medium">
                                            {auth.user.name}
                                        </span>
                                    </div>
                                    <Link
                                        href={settingsIndex()}
                                        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                                    >
                                        <Settings className="h-4 w-4" />
                                        {t('nav.settings')}
                                    </Link>
                                    <button
                                        type="button"
                                        className="flex min-h-[44px] w-full touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 text-left font-medium hover:bg-sidebar-accent"
                                        onClick={() =>
                                            setSidebarLogoutOpen(true)
                                        }
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t('nav.log_out')}
                                    </button>
                                    <LogoutConfirmDialog
                                        open={sidebarLogoutOpen}
                                        onOpenChange={setSidebarLogoutOpen}
                                    />
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                                    >
                                        {t('nav.log_in')}
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="flex min-h-[44px] touch-manipulation items-center gap-2 rounded-md px-2 py-1.5 font-medium hover:bg-sidebar-accent"
                                    >
                                        {t('nav.register')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
                    <div className="mx-auto flex min-h-11 w-full max-w-7xl items-center justify-start px-3 py-2 text-neutral-500 sm:px-4 sm:py-2.5">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
