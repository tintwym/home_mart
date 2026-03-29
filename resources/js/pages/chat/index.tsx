import { Head, Link } from '@inertiajs/react';
import { MessageCircle, Search } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type Conversation = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        image_url?: string | null;
        price: number;
        user_id: string;
        user: { id: string; name: string };
    };
    buyer: { id: string; name: string };
    messages_count: number;
    unread_count: number;
    messages: Array<{
        id: string;
        body: string;
        created_at: string;
        user_id: string;
    }>;
    updated_at: string;
};

type Props = {
    conversations: Conversation[];
};

function formatChatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
    });
}

export default function ChatIndex({ conversations }: Props) {
    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Inbox" />
            <div className="-mx-4 flex h-[calc(100vh-7rem)] overflow-hidden sm:-mx-6 lg:-mx-8">
                {/* Left panel - Chat list */}
                <aside className="flex w-full flex-col border-r border-border/50 bg-background md:w-[360px] md:shrink-0">
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold">Inbox</h1>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className="rounded-md p-2 hover:bg-muted"
                                aria-label="Search"
                            >
                                <Search className="size-5 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-2 py-2">
                            <p className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                                Chats
                            </p>
                            {conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <MessageCircle className="mb-4 size-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        No conversations yet.
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Chat with sellers by clicking the Chat
                                        button on a listing.
                                    </p>
                                    <Link
                                        href={dashboard().url}
                                        className="mt-4 font-medium hover:underline"
                                    >
                                        Browse listings
                                    </Link>
                                </div>
                            ) : (
                                <ul className="space-y-0.5">
                                    {conversations.map((conv) => {
                                        const otherUser =
                                            conv.listing.user ?? conv.buyer;
                                        const lastMessage = conv.messages[0];
                                        return (
                                            <li key={conv.id}>
                                                <Link
                                                    href={`/chat/${conv.id}`}
                                                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                                                >
                                                    <div className="size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                                        {(conv.listing
                                                            .image_url ??
                                                        conv.listing
                                                            .image_path) ? (
                                                            <img
                                                                src={
                                                                    conv.listing
                                                                        .image_url ??
                                                                    conv.listing
                                                                        .image_path ??
                                                                    ''
                                                                }
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                                                                —
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="truncate font-medium">
                                                                {otherUser.name}
                                                            </p>
                                                            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                                                                {(conv.unread_count ??
                                                                    0) > 0 && (
                                                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                                                        {conv.unread_count >
                                                                        99
                                                                            ? '99+'
                                                                            : conv.unread_count}
                                                                    </span>
                                                                )}
                                                                {formatChatDate(
                                                                    conv.updated_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <p className="truncate text-sm text-muted-foreground">
                                                            {conv.listing.title}
                                                        </p>
                                                        {lastMessage && (
                                                            <p
                                                                className={`mt-0.5 truncate text-xs ${(conv.unread_count ?? 0) > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                                                            >
                                                                {
                                                                    lastMessage.body
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="relative shrink-0 overflow-hidden rounded-lg bg-muted">
                                                        {(conv.listing
                                                            .image_url ??
                                                        conv.listing
                                                            .image_path) ? (
                                                            <img
                                                                src={
                                                                    conv.listing
                                                                        .image_url ??
                                                                    conv.listing
                                                                        .image_path ??
                                                                    ''
                                                                }
                                                                alt=""
                                                                className="size-12 object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex size-12 items-center justify-center text-xs text-muted-foreground">
                                                                —
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                        {conversations.length > 0 && (
                            <p className="border-t border-border/50 px-4 py-6 text-center text-xs text-muted-foreground">
                                That&apos;s all for your chats
                            </p>
                        )}
                    </div>
                </aside>

                {/* Right panel - Empty state (hidden on mobile) */}
                <main className="hidden flex-1 flex-col items-center justify-center bg-muted/20 md:flex">
                    <MessageCircle className="mb-4 size-16 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                        Select a chat to start messaging
                    </p>
                </main>
            </div>
        </AppLayout>
    );
}
