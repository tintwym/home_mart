import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Bell, Heart, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';

type Notification = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    created_at: string;
};

export function NotificationDropdownContent() {
    const { auth } = usePage<SharedData>().props;
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!auth?.user) return;
        fetch('/notifications', { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then(setNotifications)
            .catch(() => setNotifications([]));
    }, [auth?.user]);

    const markAsRead = (id: string) => {
        router.post(
            `/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['auth'] }),
            },
        );
    };

    const markAllAsRead = () => {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => router.reload({ only: ['auth'] }),
            },
        );
    };

    const getHref = (n: Notification) => {
        if (n.type === 'new_message' && n.data.conversation_id)
            return `/chat/${n.data.conversation_id}`;
        if (n.type === 'new_favorite' && n.data.listing_id)
            return `/listings/${n.data.listing_id}`;
        return '#';
    };

    const getIcon = (type: string) => {
        if (type === 'new_message')
            return <MessageCircle className="size-4 shrink-0" />;
        if (type === 'new_favorite')
            return <Heart className="size-4 shrink-0" />;
        return <Bell className="size-4 shrink-0" />;
    };

    const getMessage = (n: Notification) => {
        if (n.type === 'new_message')
            return `${n.data.from_user_name ?? 'Someone'} sent you a message`;
        if (n.type === 'new_favorite')
            return `${n.data.favorited_by_name ?? 'Someone'} favorited "${n.data.listing_title ?? 'your listing'}"`;
        return 'New notification';
    };

    const handleNotificationClick = (n: Notification) => {
        markAsRead(n.id);
    };

    return (
        <div className="p-2">
            <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                {notifications.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={markAllAsRead}
                    >
                        Mark all read
                    </Button>
                )}
            </div>
            {notifications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                    No new notifications
                </p>
            ) : (
                <ul className="space-y-1">
                    {notifications.map((n) => (
                        <li key={n.id}>
                            <Link
                                href={getHref(n)}
                                onClick={() => handleNotificationClick(n)}
                                className="flex items-start gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                            >
                                {getIcon(n.type)}
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium">
                                        {getMessage(n)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            n.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
