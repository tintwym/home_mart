import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from '@/hooks/use-translations';
import { logout } from '@/routes';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogout?: () => void;
};

export function LogoutConfirmDialog({ open, onOpenChange, onLogout }: Props) {
    const { t } = useTranslations();
    const handleLogout = () => {
        onLogout?.();
        onOpenChange(false);
        router.post(logout());
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{t('logout.title')}</DialogTitle>
                    <DialogDescription>{t('logout.message')}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleLogout}
                        data-test="logout-confirm-button"
                    >
                        {t('logout.log_out')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
