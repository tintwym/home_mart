import { cn } from '@/lib/utils';

type Props = {
    /** Identifier for this ad placement (e.g. for AdSense or custom scripts) */
    slotId: string;
    /** Optional size hint: 'banner' | 'rectangle' | 'sidebar' */
    size?: 'banner' | 'rectangle' | 'sidebar';
    className?: string;
};

const sizeClasses: Record<NonNullable<Props['size']>, string> = {
    banner: 'min-h-[90px] w-full max-w-[728px]',
    rectangle: 'min-h-[250px] w-full max-w-[300px]',
    sidebar: 'min-h-[600px] w-full max-w-[300px]',
};

export function AdSlot({ slotId, size = 'banner', className }: Props) {
    return (
        <div
            data-ad-slot={slotId}
            data-ad-size={size}
            className={cn(
                'flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 text-muted-foreground',
                sizeClasses[size],
                className,
            )}
            aria-label="Advertisement"
        >
            <span className="text-xs">Ad slot: {slotId}</span>
        </div>
    );
}
