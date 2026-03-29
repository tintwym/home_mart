import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CartController::index
* @see app/Http/Controllers/CartController.php:13
* @route '/cart'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CartController::index
* @see app/Http/Controllers/CartController.php:13
* @route '/cart'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CartController::index
* @see app/Http/Controllers/CartController.php:13
* @route '/cart'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CartController::index
* @see app/Http/Controllers/CartController.php:13
* @route '/cart'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const cart = {
    index: Object.assign(index, index),
}

export default cart