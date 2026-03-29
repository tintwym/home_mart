import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see routes/settings.php:27
* @route '/settings/orders'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see routes/settings.php:27
* @route '/settings/orders'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see routes/settings.php:27
* @route '/settings/orders'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see routes/settings.php:27
* @route '/settings/orders'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const orders = {
    index: Object.assign(index, index),
}

export default orders