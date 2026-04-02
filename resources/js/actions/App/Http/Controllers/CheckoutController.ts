import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CheckoutController::store
* @see app/Http/Controllers/CheckoutController.php:18
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
* @see app/Http/Controllers/CheckoutController.php:18
* @route '/checkout'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::store
* @see app/Http/Controllers/CheckoutController.php:18
* @route '/checkout'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:155
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
* @see app/Http/Controllers/CheckoutController.php:155
* @route '/checkout/success'
*/
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:155
* @route '/checkout/success'
*/
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CheckoutController::success
* @see app/Http/Controllers/CheckoutController.php:155
* @route '/checkout/success'
*/
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pReturn
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
export const twoC2pReturn = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: twoC2pReturn.url(options),
    method: 'get',
})

twoC2pReturn.definition = {
    methods: ["get","post","head"],
    url: '/checkout/2c2p/return',
} satisfies RouteDefinition<["get","post","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pReturn
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
twoC2pReturn.url = (options?: RouteQueryOptions) => {
    return twoC2pReturn.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pReturn
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
twoC2pReturn.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: twoC2pReturn.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pReturn
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
twoC2pReturn.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: twoC2pReturn.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pReturn
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
twoC2pReturn.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: twoC2pReturn.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pCallback
* @see app/Http/Controllers/CheckoutController.php:220
* @route '/checkout/2c2p/callback'
*/
export const twoC2pCallback = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: twoC2pCallback.url(options),
    method: 'post',
})

twoC2pCallback.definition = {
    methods: ["post"],
    url: '/checkout/2c2p/callback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pCallback
* @see app/Http/Controllers/CheckoutController.php:220
* @route '/checkout/2c2p/callback'
*/
twoC2pCallback.url = (options?: RouteQueryOptions) => {
    return twoC2pCallback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::twoC2pCallback
* @see app/Http/Controllers/CheckoutController.php:220
* @route '/checkout/2c2p/callback'
*/
twoC2pCallback.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: twoC2pCallback.url(options),
    method: 'post',
})

const CheckoutController = { store, success, twoC2pReturn, twoC2pCallback }

export default CheckoutController