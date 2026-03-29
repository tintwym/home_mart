import { MessageCircle, Send, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    role: 'user' | 'bot';
    text: string;
    at: Date;
};

const BOT_REPLIES: Record<string, string> = {
    help: 'chatbot.help_reply',
    contact: 'chatbot.contact_reply',
    price: 'chatbot.price_reply',
    support: 'chatbot.support_reply',
    hi: 'chatbot.greeting_reply',
    hello: 'chatbot.greeting_reply',
    default: 'chatbot.default_reply',
};

export function ChatbotWidget() {
    const { t } = useTranslations();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(() => [
        {
            id: 'welcome',
            role: 'bot',
            text: t('chatbot.welcome'),
            at: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
    }, [messages]);

    const getBotReply = (userText: string): string => {
        const lower = userText.trim().toLowerCase();
        for (const [key, replyKey] of Object.entries(BOT_REPLIES)) {
            if (key !== 'default' && lower.includes(key)) {
                return t(replyKey);
            }
        }
        return t(BOT_REPLIES.default);
    };

    const send = () => {
        const text = input.trim();
        if (!text) return;
        setInput('');
        const userMsg: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            text,
            at: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        const botText = getBotReply(text);
        const botMsg: Message = {
            id: `b-${Date.now()}`,
            role: 'bot',
            text: botText,
            at: new Date(),
        };
        setTimeout(() => setMessages((prev) => [...prev, botMsg]), 400);
    };

    return (
        <>
            <button
                type="button"
                aria-label={t('chatbot.open_label')}
                onClick={() => setOpen(true)}
                className={cn(
                    'fixed z-50 flex size-12 min-h-[48px] min-w-[48px] touch-manipulation items-center justify-center rounded-full',
                    'bg-slate-700 text-white shadow-md transition-colors hover:bg-slate-600 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:outline-none',
                    'right-[max(1rem,env(safe-area-inset-right))] bottom-[max(5rem,calc(env(safe-area-inset-bottom)+5rem))]',
                )}
            >
                <MessageCircle className="size-5" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex flex-col bg-background md:inset-auto md:top-auto md:right-[max(1rem,env(safe-area-inset-right))] md:bottom-[max(5rem,calc(env(safe-area-inset-bottom)+5rem))] md:h-[420px] md:w-[380px] md:rounded-2xl md:border md:shadow-xl"
                    aria-label={t('chatbot.panel_label')}
                >
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <span className="font-semibold">
                            {t('chatbot.title')}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('chatbot.close_label')}
                            onClick={() => setOpen(false)}
                        >
                            <X className="size-5" />
                        </Button>
                    </div>
                    <div
                        ref={listRef}
                        className="flex-1 space-y-3 overflow-y-auto p-4"
                    >
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    'flex',
                                    m.role === 'user'
                                        ? 'justify-end'
                                        : 'justify-start',
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                                        m.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted',
                                    )}
                                >
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form
                        className="flex gap-2 border-t p-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            send();
                        }}
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('chatbot.placeholder')}
                            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={t('chatbot.input_label')}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            aria-label={t('chatbot.send_label')}
                        >
                            <Send className="size-4" />
                        </Button>
                    </form>
                </div>
            )}
        </>
    );
}
