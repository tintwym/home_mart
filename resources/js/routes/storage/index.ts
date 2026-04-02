import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see routes/web.php:19
* @route '/storage/listings/{path}'
*/
export const listings = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listings.url(args, options),
    method: 'get',
})

listings.definition = {
    methods: ["get","head"],
    url: '/storage/listings/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/web.php:19
* @route '/storage/listings/{path}'
*/
listings.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    if (Array.isArray(args)) {
        args = {
            path: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        path: args.path,
    }

    return listings.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see routes/web.php:19
* @route '/storage/listings/{path}'
*/
listings.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: listings.url(args, options),
    method: 'get',
})

/**
* @see routes/web.php:19
* @route '/storage/listings/{path}'
*/
listings.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: listings.url(args, options),
    method: 'head',
})

/**
* @see vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemServiceProvider.php:98
* @route '/storage/{path}'
*/
export const local = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: local.url(args, options),
    method: 'get',
})

local.definition = {
    methods: ["get","head"],
    url: '/storage/{path}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemServiceProvider.php:98
* @route '/storage/{path}'
*/
local.url = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { path: args }
    }

    if (Array.isArray(args)) {
        args = {
            path: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        path: args.path,
    }

    return local.definition.url
            .replace('{path}', parsedArgs.path.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemServiceProvider.php:98
* @route '/storage/{path}'
*/
local.get = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: local.url(args, options),
    method: 'get',
})

/**
* @see vendor/laravel/framework/src/Illuminate/Filesystem/FilesystemServiceProvider.php:98
* @route '/storage/{path}'
*/
local.head = (args: { path: string | number } | [path: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: local.url(args, options),
    method: 'head',
})

const storage = {
    listings: Object.assign(listings, listings),
    local: Object.assign(local, local),
}

export default storage