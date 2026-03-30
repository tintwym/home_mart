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

/** Match whole words for very short triggers so "this" does not match "hi". */
function textMatchesPhrase(haystack: string, phrase: string): boolean {
    const p = phrase.trim().toLowerCase();
    if (p.length === 0) {
        return false;
    }
    if (p.length <= 3) {
        const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${escaped}\\b`, 'i').test(haystack);
    }
    return haystack.includes(p);
}

/** More specific phrases first so "I need help" gets support-style help, not the how-to-shop blurb. */
const BOT_RULES: { phrases: string[]; replyKey: string }[] = [
    {
        phrases: [
            'need help',
            'help me',
            'can you help',
            'please help',
            'i need assistance',
            'assist me',
            'having trouble',
            'having a problem',
            'not working',
            "doesn't work",
            'something wrong',
            'stuck',
            'issue with',
            'error when',
            'have a question',
            'i have a question',
            'anyone there',
        ],
        replyKey: 'chatbot.help_seek_reply',
    },
    {
        phrases: ['contact', 'email', 'reach you', 'reach out'],
        replyKey: 'chatbot.contact_reply',
    },
    {
        phrases: [
            'price',
            'cost',
            'how much',
            'expensive',
            'cheap',
            'fee',
        ],
        replyKey: 'chatbot.price_reply',
    },
    {
        phrases: [
            'support',
            'customer service',
            'talk to someone',
            'speak to someone',
        ],
        replyKey: 'chatbot.support_reply',
    },
    { phrases: ['hello', 'hey'], replyKey: 'chatbot.greeting_reply' },
    { phrases: ['hi'], replyKey: 'chatbot.greeting_reply' },
    {
        phrases: [
            'browse',
            'shopping',
            'how do i buy',
            'how to shop',
            'add to cart',
            'find listing',
            'where is cart',
        ],
        replyKey: 'chatbot.how_to_reply',
    },
];

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
        if (lower.length === 0) {
            return t('chatbot.default_reply');
        }

        if (/^help\??$|^assist(ance| me)?\??$/i.test(lower.trim())) {
            return t('chatbot.help_seek_reply');
        }

        for (const rule of BOT_RULES) {
            if (
                rule.phrases.some((phrase) => textMatchesPhrase(lower, phrase))
            ) {
                return t(rule.replyKey);
            }
        }

        if (/\bhelp\b/.test(lower)) {
            return t('chatbot.help_seek_reply');
        }

        return t('chatbot.default_reply');
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
