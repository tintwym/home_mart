import { CloudUpload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    id: string;
    label: string;
    uploadLabel: string;
    hintLabel: string;
    value: File | null;
    onChange: (file: File | null) => void;
    accept?: string;
    required?: boolean;
    capture?: 'environment' | 'user';
    error?: string;
    className?: string;
};

export function ImageUploadZone({
    id,
    label,
    uploadLabel,
    hintLabel,
    value,
    onChange,
    accept = 'image/*',
    required = false,
    capture,
    error,
    className,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const previewUrl = useMemo(() => {
        if (!value || !value.type.startsWith('image/')) return null;
        return URL.createObjectURL(value);
    }, [value]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFile = (file: File | null) => {
        if (file && !file.type.startsWith('image/')) return;
        onChange(file ?? null);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files?.[0] ?? null);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFile(file ?? null);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const onClick = () => inputRef.current?.click();

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <label
                    htmlFor={id}
                    className="shrink-0 pt-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sm:w-32 sm:pt-2.5"
                >
                    {label}
                </label>
                <div className="min-w-0 flex-1">
                    <input
                        ref={inputRef}
                        id={id}
                        type="file"
                        accept={accept}
                        capture={capture}
                        required={required}
                        className="sr-only"
                        onChange={onInputChange}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${id}-error` : undefined}
                    />
                    <button
                        type="button"
                        onClick={onClick}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={cn(
                            'flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                            isDragging && 'border-primary bg-muted/60',
                            value && 'border-primary/50 bg-primary/5',
                            error && 'border-destructive',
                        )}
                    >
                        {previewUrl ? (
                            <>
                                <img
                                    src={previewUrl}
                                    alt=""
                                    className="max-h-32 w-auto max-w-full rounded object-contain"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {value?.name}
                                </span>
                            </>
                        ) : (
                            <>
                                <CloudUpload className="size-10 text-muted-foreground" />
                                <span className="font-semibold text-foreground">
                                    {uploadLabel}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {hintLabel}
                                </span>
                            </>
                        )}
                    </button>
                    {error && (
                        <p
                            id={`${id}-error`}
                            className="mt-1.5 text-sm text-destructive"
                        >
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
