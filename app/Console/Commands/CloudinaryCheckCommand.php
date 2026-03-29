<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CloudinaryCheckCommand extends Command
{
    protected $signature = 'cloudinary:check';

    protected $description = 'Check Cloudinary config and LISTING_FILESYSTEM_DISK (run after setting .env)';

    public function handle(): int
    {
        $disk = config('filesystems.listing_disk', 'public');
        $this->line('LISTING_FILESYSTEM_DISK = '.$disk);

        if ($disk !== 'cloudinary') {
            $this->warn('Listing images will not use Cloudinary until you set LISTING_FILESYSTEM_DISK=cloudinary in .env');
            $this->line('Then run: php artisan config:clear');
        }

        $cloud = config('services.cloudinary.cloud_name');
        $key = config('services.cloudinary.api_key');
        $secret = config('services.cloudinary.api_secret');

        $this->line('');
        $this->line('Cloudinary env:');
        $this->line('  CLOUDINARY_CLOUD_NAME = '.(empty($cloud) ? '<empty>' : substr($cloud, 0, 4).'***'));
        $this->line('  CLOUDINARY_API_KEY = '.(empty($key) ? '<empty>' : substr((string) $key, 0, 4).'***'));
        $this->line('  CLOUDINARY_API_SECRET = '.(empty($secret) ? '<empty>' : '***set***'));

        if (! $cloud || ! $key || ! $secret) {
            $this->error('Set all three CLOUDINARY_* vars in .env, then run: php artisan config:clear');

            return self::FAILURE;
        }

        $this->info('Cloudinary env vars are set.');
        $this->line('Create a listing with an image; if it still fails, the form will show the exact Cloudinary error.');

        return self::SUCCESS;
    }
}
