import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import Heading from '@/components/heading';
import { ImageUploadZone } from '@/components/image-upload-zone';
import InputError from '@/components/input-error';
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

type Listing = {
    id: string;
    title: string;
    description: string;
    condition: string;
    price: number;
    image_path: string | null;
    image_url: string | null;
    meetup_location: string | null;
    category_id: string;
    category?: Category | null;
};

const CONDITION_KEYS: Record<string, string> = {
    new: 'listing.condition_new',
    like_new: 'listing.condition_like_new',
    good: 'listing.condition_good',
    fair: 'listing.condition_fair',
};

function NewImagePreview({ file, label }: { file: File; label: string }) {
    const url = URL.createObjectURL(file);
    useEffect(() => () => URL.revokeObjectURL(url), [url]);
    return (
        <p className="text-sm text-muted-foreground">
            {label}{' '}
            <img
                src={url}
                alt=""
                className="mt-1 h-20 w-20 rounded object-cover"
            />
        </p>
    );
}

type Props = {
    listing: Listing;
    categories: Category[];
};

export default function EditListing({ listing, categories }: Props) {
    const { t, categoryName } = useTranslations();
    const { currency } = useCurrency();
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: listing.title,
        description: listing.description,
        category_id: listing.category_id,
        condition: listing.condition,
        price: String(listing.price),
        meetup_location: listing.meetup_location ?? '',
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
        post(`/listings/${listing.id}`, {
            forceFormData: true,
            method: 'put',
        });
    };

    const deleteListing = () => {
        if (window.confirm(t('listing.delete_confirm'))) {
            router.delete(`/listings/${listing.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={t('listing.edit_product')} />
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
                    title={t('listing.edit_product')}
                    description={t('listing.update_listing')}
                />
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

                    <div className="space-y-3">
                        {(listing.image_url ?? listing.image_path) && (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                                <span className="shrink-0 pt-2 text-sm font-medium text-muted-foreground sm:w-32 sm:pt-2.5">
                                    {t('listing.current_image')}
                                </span>
                                <img
                                    src={
                                        listing.image_url ??
                                        listing.image_path ??
                                        ''
                                    }
                                    alt=""
                                    className="h-20 w-20 rounded object-cover"
                                />
                            </div>
                        )}
                        {data.image && (
                            <NewImagePreview
                                file={data.image}
                                label={t('listing.new_image')}
                            />
                        )}
                        <ImageUploadZone
                            id="image"
                            label={t('listing.upload_photos')}
                            uploadLabel={t('listing.upload_file')}
                            hintLabel={t('listing.drag_drop_hint')}
                            value={data.image}
                            onChange={(file) => setData('image', file)}
                            accept="image/*"
                            error={errors.image}
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                        >
                            {processing
                                ? t('common.saving')
                                : t('listing.save_changes')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                            asChild
                        >
                            <Link href={dashboard()}>{t('common.cancel')}</Link>
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="min-h-[44px] touch-manipulation sm:min-h-0"
                            onClick={deleteListing}
                        >
                            {t('listing.delete_listing')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
