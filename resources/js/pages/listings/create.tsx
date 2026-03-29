import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Heading from '@/components/heading';
import { ImageUploadZone } from '@/components/image-upload-zone';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/use-currency';
import { useTranslations } from '@/hooks/use-translations';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

type Category = {
    id: string;
    name: string;
    slug: string;
};

const CONDITION_KEYS: Record<string, string> = {
    new: 'listing.condition_new',
    like_new: 'listing.condition_like_new',
    good: 'listing.condition_good',
    fair: 'listing.condition_fair',
};

type Props = {
    categories: Category[];
    listingCount: number;
    maxListingSlots: number;
    canCreate: boolean;
    slotPriceLabel: string;
};

export default function CreateListing({
    categories,
    listingCount,
    maxListingSlots,
    canCreate,
    slotPriceLabel,
}: Props) {
    const { t, categoryName } = useTranslations();
    const { currency } = useCurrency();
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '',
        condition: 'good',
        price: '',
        meetup_location: '',
        image: null as File | null,
    });

    const conditionOptions = [
        { value: 'new', labelKey: CONDITION_KEYS.new },
        { value: 'like_new', labelKey: CONDITION_KEYS.like_new },
        { value: 'good', labelKey: CONDITION_KEYS.good },
        { value: 'fair', labelKey: CONDITION_KEYS.fair },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/listings', {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={t('listing.add_product')} />
            <div className="mx-auto w-full max-w-2xl px-0 sm:px-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-1 flex min-h-[44px] touch-manipulation justify-start sm:min-h-8"
                    asChild
                >
                    <Link
                        href={dashboard()}
                        className="inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="size-4" />
                        {t('common.back')}
                    </Link>
                </Button>
                <Heading
                    title={t('listing.add_product')}
                    description={t('listing.create_listing')}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                    {t('listing.your_listings')}: {listingCount}
                    {maxListingSlots < 10000 && ` / ${maxListingSlots}`}
                </p>
                {!canCreate && maxListingSlots < 10000 && (
                    <Alert className="mt-4 border-amber-500/50 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20">
                        <AlertDescription>
                            {t('listing.listing_limit')}{' '}
                            <Link
                                href="/upgrades"
                                className="ml-1 font-medium text-amber-700 underline dark:text-amber-400"
                            >
                                {t('listing.buy_slots')} ({slotPriceLabel})
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}
                <form
                    onSubmit={submit}
                    className="mt-6 space-y-6 [&_input]:min-h-[44px] [&_input]:touch-manipulation sm:[&_input]:min-h-0 [&_select]:min-h-[44px] [&_select]:touch-manipulation sm:[&_select]:min-h-0 [&_textarea]:min-h-[88px]"
                >
                    <div className="space-y-2">
                        <Label htmlFor="title">{t('listing.title')}</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder={t('listing.product_title')}
                            className="w-full"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            {t('listing.description')}
                        </Label>
                        <textarea
                            id="description"
                            rows={4}
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder={t('listing.describe_product')}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('listing.category')}</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={(value) =>
                                setData('category_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue
                                    placeholder={t('listing.select_category')}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {categoryName(cat)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('listing.condition')}</Label>
                        <Select
                            value={data.condition}
                            onValueChange={(value) =>
                                setData('condition', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {conditionOptions.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {t(opt.labelKey)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.condition} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">
                            {t('listing.price', {
                                symbol: currency.symbol,
                            })}
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder={t('listing.price_placeholder')}
                        />
                        <InputError message={errors.price} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="meetup_location">
                            {t('listing.meetup_location')}
                        </Label>
                        <Input
                            id="meetup_location"
                            value={data.meetup_location}
                            onChange={(e) =>
                                setData('meetup_location', e.target.value)
                            }
                            placeholder={t('listing.meetup_placeholder')}
                        />
                        <p className="text-sm text-muted-foreground">
                            {t('listing.meetup_help')}
                        </p>
                        <InputError message={errors.meetup_location} />
                    </div>

                    <ImageUploadZone
                        id="image"
                        label={t('listing.upload_photos')}
                        uploadLabel={t('listing.upload_file')}
                        hintLabel={t('listing.drag_drop_hint')}
                        value={data.image}
                        onChange={(file) => setData('image', file)}
                        accept="image/*"
                        required
                        error={errors.image}
                    />

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            type="submit"
                            disabled={processing || !canCreate}
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                        >
                            {processing
                                ? t('listing.creating')
                                : t('listing.create_btn')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                            asChild
                        >
                            <Link href={dashboard()}>{t('common.cancel')}</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
