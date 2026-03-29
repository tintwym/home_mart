import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:18
* @route '/api/listings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/listings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:18
* @route '/api/listings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:18
* @route '/api/listings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:18
* @route '/api/listings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:58
* @route '/api/listings/{listing}'
*/
export const show = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/listings/{listing}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:58
* @route '/api/listings/{listing}'
*/
show.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { listing: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { listing: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            listing: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        listing: typeof args.listing === 'object'
        ? args.listing.id
        : args.listing,
    }

    return show.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:58
* @route '/api/listings/{listing}'
*/
show.get = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:58
* @route '/api/listings/{listing}'
*/
show.head = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const ListingApiController = { index, show }

export default ListingApiController