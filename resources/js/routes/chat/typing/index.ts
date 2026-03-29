import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ChatController::status
* @see app/Http/Controllers/ChatController.php:226
* @route '/chat/{conversation}/typing'
*/
export const status = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/chat/{conversation}/typing',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ChatController::status
* @see app/Http/Controllers/ChatController.php:226
* @route '/chat/{conversation}/typing'
*/
status.url = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
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

    return status.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ChatController::status
* @see app/Http/Controllers/ChatController.php:226
* @route '/chat/{conversation}/typing'
*/
status.get = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ChatController::status
* @see app/Http/Controllers/ChatController.php:226
* @route '/chat/{conversation}/typing'
*/
status.head = (args: { conversation: string | { id: string } } | [conversation: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(args, options),
    method: 'head',
})

