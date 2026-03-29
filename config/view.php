<?php

return [

    /*
    |--------------------------------------------------------------------------
    | View Storage Paths
    |--------------------------------------------------------------------------
    |
    | Most templating systems load templates from disk. Here you may specify
    | an array of paths that should be checked for your views.
    |
    */

    'paths' => [
        resource_path('views'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compiled View Path
    |--------------------------------------------------------------------------
    |
    | This option determines where all the compiled Blade templates are stored.
    | Typically, this is within the storage directory.
    |
    */

    'compiled' => env('VIEW_COMPILED_PATH', (function (): string {
        $tmpCompiled = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.'laravel-view-compiled';

        // Vercel / serverless: only /tmp is writable; VERCEL is usually set but not always visible to PHP.
        if (filter_var(env('VERCEL'), FILTER_VALIDATE_BOOLEAN)) {
            return $tmpCompiled;
        }

        $storageViews = storage_path('framework/views');

        return is_writable(dirname($storageViews)) ? $storageViews : $tmpCompiled;
    })()),

];
