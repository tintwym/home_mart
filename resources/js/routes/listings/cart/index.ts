import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\CartController::store
* @see app/Http/Controllers/CartController.php:26
* @route '/listings/{listing}/cart'
*/
export const store = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/listings/{listing}/cart',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CartController::store
* @see app/Http/Controllers/CartController.php:26
* @route '/listings/{listing}/cart'
*/
store.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CartController::store
* @see app/Http/Controllers/CartController.php:26
* @route '/listings/{listing}/cart'
*/
store.post = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CartController::destroy
* @see app/Http/Controllers/CartController.php:44
* @route '/listings/{listing}/cart'
*/
export const destroy = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/listings/{listing}/cart',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CartController::destroy
* @see app/Http/Controllers/CartController.php:44
* @route '/listings/{listing}/cart'
*/
destroy.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CartController::destroy
* @see app/Http/Controllers/CartController.php:44
* @route '/listings/{listing}/cart'
*/
destroy.delete = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const cart = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default cart