import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCheck,
    ImagePlus,
    Search,
    Send,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/use-currency';
import AppLayout from '@/layouts/app-layout';

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatMessageTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatChatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

type Message = {
    id: string;
    body: string;
    created_at: string;
    user: { id: string; name: string } | null;
    user_id: string;
    read_at: string | null;
    status: 'sent' | 'delivered' | 'seen' | null;
};

type ConversationItem = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        image_url?: string | null;
        price: number;
        user_id: string;
        user: { id: string; name: string; region?: string | null } | null;
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

type Conversation = {
    id: string;
    listing: {
        id: string;
        title: string;
        image_path: string | null;
        image_url?: string | null;
        price: number;
        user: { id: string; name: string; region?: string | null } | null;
    };
    buyer: { id: string; name: string };
};

type Props = {
    conversations: ConversationItem[];
    conversation: Conversation;
    messages: Message[];
    messages_has_more?: boolean;
};

function getCsrfToken(): string {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? ''
    );
}

/** Message list with polling; keyed by conversation.id so state resets when switching chats. */
function ChatMessageList({
    conversationId,
    initialMessages,
    currentUserId,
    otherTypingName,
}: {
    conversationId: string;
    initialMessages: Message[];
    currentUserId: string | undefined;
    otherTypingName: string | null;
}) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [appendedMessages, setAppendedMessages] = useState<Message[]>([]);
    const lastMessageCreatedRef = useRef<string | null>(null);

    const messages = useMemo(() => {
        const byId = new Map<string, Message>();
        for (const m of initialMessages) byId.set(m.id, m);
        for (const m of appendedMessages) byId.set(m.id, m);
        return Array.from(byId.values()).sort(
            (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime(),
        );
    }, [initialMessages, appendedMessages]);

    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1]?.created_at) {
            lastMessageCreatedRef.current =
                messages[messages.length - 1].created_at;
        }
    }, [messages]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const after = lastMessageCreatedRef.current;
            if (!after) return;
            try {
                const res = await fetch(
                    `/chat/${conversationId}/messages/since?after=${encodeURIComponent(after)}`,
                    {
                        credentials: 'include',
                        headers: { Accept: 'application/json' },
                    },
                );
                if (!res.ok) return;
                const { messages: newMsgs } = (await res.json()) as {
                    messages: Message[];
                };
                if (newMsgs.length > 0) {
                    setAppendedMessages((prev) => {
                        const ids = new Set(
                            initialMessages
                                .map((m) => m.id)
                                .concat(prev.map((m) => m.id)),
                        );
                        const added = newMsgs.filter((m) => !ids.has(m.id));
                        if (added.length === 0) return prev;
                        const last = added[added.length - 1]?.created_at;
                        if (last) lastMessageCreatedRef.current = last;
                        return [...prev, ...added];
                    });
                }
            } catch {
                // ignore
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [conversationId, initialMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sortedMessages = messages;
    const messageGroups = sortedMessages.reduce<
        Array<{ date: string; msgs: Message[] }>
    >((groups: Array<{ date: string; msgs: Message[] }>, msg: Message) => {
        const date = msg.created_at.split('T')[0];
        const last = groups[groups.length - 1];
        if (last && last.date === date) {
            last.msgs.push(msg);
        } else {
            groups.push({ date, msgs: [msg] });
        }
        return groups;
    }, []);

    return (
        <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
            {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    No messages yet. Say hello!
                </p>
            ) : (
                <div className="space-y-4">
                    {messageGroups.map(
                        (group: { date: string; msgs: Message[] }) => (
                            <div key={group.date}>
                                <p className="mb-3 text-center text-xs text-muted-foreground">
                                    {formatChatDate(group.msgs[0].created_at)}
                                </p>
                                <div className="space-y-0.5">
                                    {group.msgs.map(
                                        (msg: Message, i: number) => {
                                            const isOwn =
                                                msg.user_id === currentUserId;
                                            const prev = group.msgs[i - 1];
                                            const prevSameSender =
                                                prev &&
                                                prev.user_id === msg.user_id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] rounded-2xl px-3 py-1.5 shadow-sm ${
                                                            isOwn
                                                                ? `rounded-br-md ${prevSameSender ? 'rounded-tr-md' : ''} bg-[#005c4b] text-[#e9edef]`
                                                                : `rounded-bl-md ${prevSameSender ? 'rounded-tl-md' : ''} border border-border bg-background`
                                                        }`}
                                                    >
                                                        <p className="text-sm break-words">
                                                            {msg.body}
                                                        </p>
                                                        <div
                                                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isOwn ? 'text-[#8696a0]' : 'text-muted-foreground'}`}
                                                        >
                                                            <span>
                                                                {formatMessageTime(
                                                                    msg.created_at,
                                                                )}
                                                            </span>
                                                            {isOwn &&
                                                                msg.status && (
                                                                    <span
                                                                        className={
                                                                            msg.status ===
                                                                            'seen'
                                                                                ? 'text-[#53bdeb]'
                                                                                : ''
                                                                        }
                                                                    >
                                                                        {msg.status ===
                                                                        'sent' ? (
                                                                            <Check className="size-3.5" />
                                                                        ) : (
                                                                            <CheckCheck className="size-3.5" />
                                                                        )}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        ),
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}
            {otherTypingName && (
                <p className="py-1 text-xs text-muted-foreground italic">
                    {otherTypingName} is typing…
                </p>
            )}
        </div>
    );
}

export default function ChatShow({
    conversations,
    conversation,
    messages: initialMessages,
}: Props) {
    const { auth } = usePage<{ auth: { user?: { id: string } } }>().props;
    const { formatPrice, currency } = useCurrency();
    const currentUserId = auth?.user?.id;
    const [offerModalOpen, setOfferModalOpen] = useState(false);
    const [offerPrice, setOfferPrice] = useState('');
    const [offerSubmitting, setOfferSubmitting] = useState(false);
    const [loadingConversationId, setLoadingConversationId] = useState<
        string | null
    >(null);
    const [otherTypingName, setOtherTypingName] = useState<string | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        body: '',
    });

    // Typing: notify server when user types (throttled)
    const notifyTyping = useCallback(() => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            fetch(`/chat/${conversation.id}/typing`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            }).catch(() => {});
            typingTimeoutRef.current = null;
        }, 400);
    }, [conversation.id]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);
        };
    }, []);

    // Poll for other user typing
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/chat/${conversation.id}/typing`, {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const { typing: isTyping, user_name: name } =
                    (await res.json()) as {
                        typing: boolean;
                        user_name?: string | null;
                    };
                setOtherTypingName(isTyping && name ? name : null);
            } catch {
                setOtherTypingName(null);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [conversation.id]);

    // Show seller (listing owner) as the other party name
    const otherUser = conversation.listing.user ?? conversation.buyer;

    const submitOffer = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseFloat(offerPrice.replace(/,/g, ''));
        if (Number.isNaN(num) || num < 0) return;
        const offerText = `I'm offering ${formatPrice(num, conversation.listing.user?.region)}`;
        setOfferSubmitting(true);
        router.post(
            `/chat/${conversation.id}/messages`,
            { body: offerText },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOfferPrice('');
                    setOfferModalOpen(false);
                },
                onFinish: () => setOfferSubmitting(false),
            },
        );
    };

    const submitMessage = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/chat/${conversation.id}/messages`, {
            onSuccess: () => reset('body'),
        });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={`Chat with ${otherUser?.name ?? 'Unknown'}`} />
            <div className="-mx-4 flex h-[calc(100vh-7rem)] overflow-hidden sm:-mx-6 lg:-mx-8">
                {/* Left panel - Chat list (hidden on mobile when viewing conversation) */}
                <aside className="hidden w-full flex-col border-r border-border/50 bg-background md:flex md:w-[360px] md:shrink-0">
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
                        <h1 className="text-xl font-semibold">Inbox</h1>
                        <button
                            type="button"
                            className="rounded-md p-2 hover:bg-muted"
                            aria-label="Search"
                        >
                            <Search className="size-5 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-2 py-2">
                            <p className="mb-2 px-2 text-sm font-medium text-muted-foreground">
                                Chats
                            </p>
                            <ul className="space-y-0.5">
                                {conversations.map((conv) => {
                                    const other =
                                        conv.listing.user ?? conv.buyer;
                                    const lastMessage = conv.messages[0];
                                    const isActive =
                                        conv.id === conversation.id;
                                    return (
                                        <li key={conv.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (
                                                        conv.id ===
                                                        conversation.id
                                                    )
                                                        return;
                                                    setLoadingConversationId(
                                                        conv.id,
                                                    );
                                                    router.get(
                                                        `/chat/${conv.id}`,
                                                        undefined,
                                                        {
                                                            preserveState: false,
                                                            onFinish: () =>
                                                                setLoadingConversationId(
                                                                    null,
                                                                ),
                                                        },
                                                    );
                                                }}
                                                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                                                    isActive
                                                        ? 'bg-muted'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="size-12 shrink-0 overflow-hidden rounded-full bg-muted">
                                                    {(conv.listing.image_url ??
                                                    conv.listing.image_path) ? (
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
                                                            {other?.name ??
                                                                'Unknown'}
                                                        </p>
                                                        {(conv.unread_count ??
                                                            0) > 0 && (
                                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                                                {conv.unread_count >
                                                                99
                                                                    ? '99+'
                                                                    : conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-sm text-muted-foreground">
                                                        {conv.listing.title}
                                                    </p>
                                                    {lastMessage && (
                                                        <p
                                                            className={`mt-0.5 truncate text-xs ${(conv.unread_count ?? 0) > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                                                        >
                                                            {lastMessage.body}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 overflow-hidden rounded-lg bg-muted">
                                                    {(conv.listing.image_url ??
                                                    conv.listing.image_path) ? (
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
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <p className="border-t border-border/50 px-4 py-6 text-center text-xs text-muted-foreground">
                            That&apos;s all for your chats
                        </p>
                    </div>
                </aside>

                {/* Right panel - Conversation */}
                <main className="flex min-w-0 flex-1 flex-col bg-muted/20">
                    {loadingConversationId ? (
                        <>
                            <div className="flex items-center gap-3 border-b border-border/50 bg-background px-4 py-3">
                                <Skeleton className="size-10 shrink-0 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="border-b border-border/50 bg-background px-4 py-3">
                                <div className="flex gap-3">
                                    <Skeleton className="size-14 shrink-0 rounded-lg" />
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 p-4">
                                <Skeleton className="mx-auto h-4 w-48" />
                                <div className="space-y-2">
                                    <Skeleton className="ml-0 h-12 w-3/4 rounded-2xl" />
                                    <Skeleton className="mr-0 ml-auto h-10 w-1/2 rounded-2xl" />
                                    <Skeleton className="ml-0 h-12 w-2/3 rounded-2xl" />
                                </div>
                            </div>
                            <div className="border-t border-border/50 bg-background p-4">
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center justify-between border-b border-border/50 bg-background px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <Link
                                        href="/chat"
                                        aria-label="Back to chats"
                                        className="flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md text-foreground hover:bg-accent md:hidden"
                                    >
                                        <ArrowLeft className="size-5" />
                                    </Link>
                                    <Avatar className="size-10 shrink-0">
                                        <AvatarFallback className="text-sm font-medium">
                                            {getInitials(otherUser?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">
                                            {otherUser?.name ?? 'Unknown'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Online
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Item summary */}
                            <div className="border-b border-border/50 bg-background px-4 py-3">
                                <Link
                                    href={`/listings/${conversation.listing.id}`}
                                    className="flex items-center gap-3"
                                >
                                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        {(conversation.listing.image_url ??
                                        conversation.listing.image_path) ? (
                                            <img
                                                src={
                                                    conversation.listing
                                                        .image_url ??
                                                    conversation.listing
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
                                        <p className="truncate font-medium">
                                            {conversation.listing.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatPrice(
                                                conversation.listing.price,
                                                conversation.listing.user
                                                    ?.region,
                                            )}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setOfferModalOpen(true);
                                        }}
                                    >
                                        Make offer
                                    </Button>
                                </Link>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Only you can see this
                                </p>
                            </div>

                            {/* Make offer modal */}
                            <Dialog
                                open={offerModalOpen}
                                onOpenChange={setOfferModalOpen}
                            >
                                <DialogContent className="sm:max-w-md">
                                    <form onSubmit={submitOffer}>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Make an offer
                                            </DialogTitle>
                                            <DialogDescription>
                                                Enter your offer price for{' '}
                                                {conversation.listing.title}. It
                                                will be sent as a message in the
                                                chat.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="offer-price">
                                                    Your offer (
                                                    {currency.symbol})
                                                </Label>
                                                <Input
                                                    id="offer-price"
                                                    type="text"
                                                    inputMode="decimal"
                                                    placeholder={String(
                                                        conversation.listing
                                                            .price,
                                                    )}
                                                    value={offerPrice}
                                                    onChange={(e) =>
                                                        setOfferPrice(
                                                            e.target.value,
                                                        )
                                                    }
                                                    disabled={offerSubmitting}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setOfferModalOpen(false)
                                                }
                                                disabled={offerSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    offerSubmitting ||
                                                    !offerPrice.trim()
                                                }
                                            >
                                                {offerSubmitting
                                                    ? 'Sending…'
                                                    : 'Send offer'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {/* Messages (keyed by conversation so polling state resets when switching) */}
                            <ChatMessageList
                                key={conversation.id}
                                conversationId={conversation.id}
                                initialMessages={initialMessages}
                                currentUserId={currentUserId}
                                otherTypingName={otherTypingName}
                            />

                            {/* Input - WhatsApp style */}
                            <form
                                onSubmit={submitMessage}
                                className="flex items-end gap-2 border-t border-border/50 bg-background px-4 py-3"
                            >
                                <button
                                    type="button"
                                    className="shrink-0 rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Attach"
                                >
                                    <ImagePlus className="size-6" />
                                </button>
                                <input
                                    type="text"
                                    value={data.body}
                                    onChange={(e) => {
                                        setData('body', e.target.value);
                                        notifyTyping();
                                    }}
                                    placeholder="Message"
                                    className="min-w-0 flex-1 rounded-full border border-input bg-muted/50 py-2.5 pr-4 pl-5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-10 w-10 shrink-0 rounded-full bg-[#005c4b] hover:bg-[#004d40]"
                                    disabled={processing || !data.body.trim()}
                                >
                                    <Send className="size-5" />
                                </Button>
                                <InputError message={errors.body} />
                            </form>
                        </>
                    )}
                </main>
            </div>
        </AppLayout>
    );
}
