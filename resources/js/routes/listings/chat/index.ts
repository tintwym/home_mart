import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:124
* @route '/listings/{listing}/chat'
*/
export const store = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/listings/{listing}/chat',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:124
* @route '/listings/{listing}/chat'
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
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:124
* @route '/listings/{listing}/chat'
*/
store.post = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const chat = {
    store: Object.assign(store, store),
}

export default chat