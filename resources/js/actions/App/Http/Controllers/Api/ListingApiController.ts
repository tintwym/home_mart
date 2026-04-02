import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/api/listings'
*/
const indexf02c5bce802b849aeafb707c22b4fe45 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf02c5bce802b849aeafb707c22b4fe45.url(options),
    method: 'get',
})

indexf02c5bce802b849aeafb707c22b4fe45.definition = {
    methods: ["get","head"],
    url: '/api/listings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/api/listings'
*/
indexf02c5bce802b849aeafb707c22b4fe45.url = (options?: RouteQueryOptions) => {
    return indexf02c5bce802b849aeafb707c22b4fe45.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/api/listings'
*/
indexf02c5bce802b849aeafb707c22b4fe45.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexf02c5bce802b849aeafb707c22b4fe45.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/api/listings'
*/
indexf02c5bce802b849aeafb707c22b4fe45.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexf02c5bce802b849aeafb707c22b4fe45.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/mapi/listings'
*/
const index4499e50ce5e55b2bea2dcef449ffa0c2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index4499e50ce5e55b2bea2dcef449ffa0c2.url(options),
    method: 'get',
})

index4499e50ce5e55b2bea2dcef449ffa0c2.definition = {
    methods: ["get","head"],
    url: '/mapi/listings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/mapi/listings'
*/
index4499e50ce5e55b2bea2dcef449ffa0c2.url = (options?: RouteQueryOptions) => {
    return index4499e50ce5e55b2bea2dcef449ffa0c2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/mapi/listings'
*/
index4499e50ce5e55b2bea2dcef449ffa0c2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index4499e50ce5e55b2bea2dcef449ffa0c2.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::index
* @see app/Http/Controllers/Api/ListingApiController.php:19
* @route '/mapi/listings'
*/
index4499e50ce5e55b2bea2dcef449ffa0c2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index4499e50ce5e55b2bea2dcef449ffa0c2.url(options),
    method: 'head',
})

export const index = {
    '/api/listings': indexf02c5bce802b849aeafb707c22b4fe45,
    '/mapi/listings': index4499e50ce5e55b2bea2dcef449ffa0c2,
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/api/listings/{listing}'
*/
const show1a74744b699a700f50c622a7e3e76c4e = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show1a74744b699a700f50c622a7e3e76c4e.url(args, options),
    method: 'get',
})

show1a74744b699a700f50c622a7e3e76c4e.definition = {
    methods: ["get","head"],
    url: '/api/listings/{listing}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/api/listings/{listing}'
*/
show1a74744b699a700f50c622a7e3e76c4e.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return show1a74744b699a700f50c622a7e3e76c4e.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/api/listings/{listing}'
*/
show1a74744b699a700f50c622a7e3e76c4e.get = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show1a74744b699a700f50c622a7e3e76c4e.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/api/listings/{listing}'
*/
show1a74744b699a700f50c622a7e3e76c4e.head = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show1a74744b699a700f50c622a7e3e76c4e.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/mapi/listings/{listing}'
*/
const show6c6f37ef86ebc3c670c2494aef19b73b = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show6c6f37ef86ebc3c670c2494aef19b73b.url(args, options),
    method: 'get',
})

show6c6f37ef86ebc3c670c2494aef19b73b.definition = {
    methods: ["get","head"],
    url: '/mapi/listings/{listing}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/mapi/listings/{listing}'
*/
show6c6f37ef86ebc3c670c2494aef19b73b.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return show6c6f37ef86ebc3c670c2494aef19b73b.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/mapi/listings/{listing}'
*/
show6c6f37ef86ebc3c670c2494aef19b73b.get = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show6c6f37ef86ebc3c670c2494aef19b73b.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\ListingApiController::show
* @see app/Http/Controllers/Api/ListingApiController.php:61
* @route '/mapi/listings/{listing}'
*/
show6c6f37ef86ebc3c670c2494aef19b73b.head = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show6c6f37ef86ebc3c670c2494aef19b73b.url(args, options),
    method: 'head',
})

export const show = {
    '/api/listings/{listing}': show1a74744b699a700f50c622a7e3e76c4e,
    '/mapi/listings/{listing}': show6c6f37ef86ebc3c670c2494aef19b73b,
}

const ListingApiController = { index, show }

export default ListingApiController