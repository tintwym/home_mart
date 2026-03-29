import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppHeaderLayout breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppHeaderLayout>
);
