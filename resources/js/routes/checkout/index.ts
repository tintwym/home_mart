import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CheckoutController::store
* @see app/Http/Controllers/CheckoutController.php:14
* @route '/checkout'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CheckoutController::store
* @see app/Http/Controllers/CheckoutController.php:14
* @route '/checkout'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::store
* @see app/Http/Controllers/CheckoutController.php:14
* @route '/checkout'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:81
* @route '/checkout/success'
*/
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/checkout/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:81
* @route '/checkout/success'
*/
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:81
* @route '/checkout/success'
*/
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:81
* @route '/checkout/success'
*/
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

const checkout = {
    store: Object.assign(store, store),
    success: Object.assign(success, success),
}

export default checkout