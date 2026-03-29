import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, ExternalLink, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Props = {
    playStoreUrl: string | null;
    apkAvailable: boolean;
    apkUrl: string | null;
    iosStoreUrl: string | null;
};

export default function DownloadPage({
    playStoreUrl,
    apkAvailable,
    apkUrl,
    iosStoreUrl,
}: Props) {
    const { t } = useTranslations();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('common.back'), href: '/' },
        { title: t('download.title'), href: '/download' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('download.title')} />
            <div className="mx-auto max-w-xl space-y-8 py-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                        <Smartphone className="size-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {t('download.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('download.description')}
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Google Play (native Kotlin app) */}
                    <section className="rounded-lg border bg-muted/20 p-4">
                        <h2 className="mb-3 font-medium">
                            {t('download.play_section')}
                        </h2>
                        {playStoreUrl ? (
                            <a
                                href={playStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full justify-center"
                            >
                                <Button
                                    size="lg"
                                    className="min-h-12 w-full gap-2 sm:min-w-[200px]"
                                >
                                    <ExternalLink className="size-5" />
                                    {t('download.play_button')}
                                </Button>
                            </a>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('download.play_coming_soon')}
                            </p>
                        )}
                    </section>

                    {/* Optional sideload APK (e.g. internal testing) */}
                    <section className="rounded-lg border bg-muted/20 p-4">
                        <h2 className="mb-3 font-medium">
                            {t('download.apk_section')}
                        </h2>
                        {apkAvailable && apkUrl ? (
                            <div className="space-y-3">
                                <a
                                    href={apkUrl}
                                    download="homemart.apk"
                                    className="flex w-full justify-center"
                                >
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        className="min-h-12 w-full gap-2 sm:min-w-[200px]"
                                    >
                                        <Download className="size-5" />
                                        {t('download.button')}
                                    </Button>
                                </a>
                                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                                    <li>{t('download.step1')}</li>
                                    <li>{t('download.step2')}</li>
                                    <li>{t('download.step3')}</li>
                                </ol>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('download.coming_soon')}
                            </p>
                        )}
                    </section>

                    {/* iOS */}
                    <section className="rounded-lg border bg-muted/20 p-4">
                        <h2 className="mb-3 font-medium">
                            {t('download.ios')}
                        </h2>
                        {iosStoreUrl ? (
                            <a
                                href={iosStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full justify-center"
                            >
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="min-h-12 w-full gap-2 sm:min-w-[200px]"
                                >
                                    {t('download.ios_button')}
                                </Button>
                            </a>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {t('download.ios_coming_soon')}
                            </p>
                        )}
                    </section>
                </div>

                <div className="flex justify-center">
                    <Button variant="ghost" size="sm" asChild>
                        <Link
                            href={dashboard().url}
                            className="inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="size-4" />
                            {t('common.back')}
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
