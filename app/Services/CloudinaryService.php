<?php

namespace App\Services;

use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected static function configured(): bool
    {
        $cloud = config('services.cloudinary.cloud_name');
        $key = config('services.cloudinary.api_key');
        $secret = config('services.cloudinary.api_secret');

        return ! empty(trim((string) $cloud)) && ! empty(trim((string) $key)) && ! empty(trim((string) $secret));
    }

    /**
     * Build Cloudinary URL for SDK (cloudinary://api_key:api_secret@cloud_name).
     * Key and secret are URL-encoded in case they contain special characters.
     */
    protected static function cloudinaryUrl(): string
    {
        $cloud = trim((string) config('services.cloudinary.cloud_name'));
        $key = trim((string) config('services.cloudinary.api_key'));
        $secret = trim((string) config('services.cloudinary.api_secret'));

        return 'cloudinary://'.rawurlencode($key).':'.rawurlencode($secret).'@'.$cloud;
    }

    /**
     * Upload an image to Cloudinary and return the secure URL.
     *
     * @throws \RuntimeException when not configured, file unreadable, or Cloudinary API fails (message is safe to show)
     */
    public static function upload(UploadedFile $file, string $folder = 'listings'): string
    {
        if (! self::configured()) {
            Log::warning('Cloudinary upload skipped: missing CLOUDINARY_* env vars');
            throw new \RuntimeException('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env, and LISTING_FILESYSTEM_DISK=cloudinary. Then run: php artisan config:clear');
        }

        $path = $file->getRealPath();
        if (! $path || ! is_readable($path)) {
            Log::warning('Cloudinary upload failed: file path not readable');
            throw new \RuntimeException('Uploaded file could not be read. Try another image.');
        }

        try {
            $config = Configuration::fromCloudinaryUrl(self::cloudinaryUrl());
            $api = new UploadApi($config);
            $result = $api->upload($path, [
                'folder' => $folder,
                'resource_type' => 'image',
            ]);
            $response = $result->getArrayCopy();
            $url = $response['secure_url'] ?? null;

            if (! $url) {
                Log::warning('Cloudinary upload returned no secure_url', ['response' => $response]);
                throw new \RuntimeException('Cloudinary did not return an image URL. Check your Cloudinary dashboard.');
            }

            return $url;
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Cloudinary upload failed', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw new \RuntimeException('Cloudinary upload failed: '.$e->getMessage());
        }
    }

    /**
     * Delete an asset by URL (extracts public_id from Cloudinary URL). No-op if not a Cloudinary URL.
     */
    public static function deleteByUrl(string $url): bool
    {
        if (! self::configured() || ! str_contains($url, 'res.cloudinary.com')) {
            return false;
        }

        $publicId = self::publicIdFromUrl($url);
        if (! $publicId) {
            return false;
        }

        try {
            $config = \Cloudinary\Configuration\Configuration::fromCloudinaryUrl(self::cloudinaryUrl());
            $api = new \Cloudinary\Api\Admin\AdminApi($config);
            $api->deleteAssets($publicId);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    protected static function publicIdFromUrl(string $url): ?string
    {
        if (! preg_match('#/v\d+/(.+?)\.(?:jpg|jpeg|png|gif|webp)(?:\?|$)#', $url, $m)) {
            return null;
        }

        return $m[1];
    }
}
