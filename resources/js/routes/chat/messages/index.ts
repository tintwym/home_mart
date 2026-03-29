import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::since
* @see app/Http/Controllers/ChatController.php:171
* @route '/chat/{conversation}/messages/since'
*/
export const since = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: since.url(args, options),
    method: 'get',
})

since.definition = {
    methods: ["get","head"],
    url: '/chat/{conversation}/messages/since',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::since
* @see app/Http/Controllers/ChatController.php:171
* @route '/chat/{conversation}/messages/since'
*/
since.url = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { conversation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return since.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::since
* @see app/Http/Controllers/ChatController.php:171
* @route '/chat/{conversation}/messages/since'
*/
since.get = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: since.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::since
* @see app/Http/Controllers/ChatController.php:171
* @route '/chat/{conversation}/messages/since'
*/
since.head = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: since.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:142
* @route '/chat/{conversation}/messages'
*/
export const store = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/chat/{conversation}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:142
* @route '/chat/{conversation}/messages'
*/
store.url = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { conversation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return store.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::store
* @see app/Http/Controllers/ChatController.php:142
* @route '/chat/{conversation}/messages'
*/
store.post = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const messages = {
    since: Object.assign(since, since),
    store: Object.assign(store, store),
}

export default messages