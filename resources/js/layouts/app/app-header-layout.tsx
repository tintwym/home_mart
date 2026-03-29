import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { ChatbotWidget } from '@/components/chatbot-widget';
import type { AppLayoutProps } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
            <ChatbotWidget />
        </AppShell>
    );
}
