import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\CheckoutController::returnMethod
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
export const returnMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: returnMethod.url(options),
    method: 'get',
})

returnMethod.definition = {
    methods: ["get","post","head"],
    url: '/checkout/2c2p/return',
} satisfies RouteDefinition<["get","post","head"]>

/**
* @see \App\Http\Controllers\CheckoutController::returnMethod
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
returnMethod.url = (options?: RouteQueryOptions) => {
    return returnMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::returnMethod
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
returnMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: returnMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\CheckoutController::returnMethod
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
returnMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: returnMethod.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CheckoutController::returnMethod
* @see app/Http/Controllers/CheckoutController.php:183
* @route '/checkout/2c2p/return'
*/
returnMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: returnMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\CheckoutController::callback
* @see app/Http/Controllers/CheckoutController.php:220
* @route '/checkout/2c2p/callback'
*/
export const callback = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: callback.url(options),
    method: 'post',
})

callback.definition = {
    methods: ["post"],
    url: '/checkout/2c2p/callback',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CheckoutController::callback
* @see app/Http/Controllers/CheckoutController.php:220
* @route '/checkout/2c2p/callback'
*/
callback.url = (options?: RouteQueryOptions) => {
    return callback.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CheckoutController::callback
* @see app/Http/Controllers/CheckoutController.php:220
* @route '/checkout/2c2p/callback'
*/
callback.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: callback.url(options),
    method: 'post',
})

const twoc2p = {
    return: Object.assign(returnMethod, returnMethod),
    callback: Object.assign(callback, callback),
}

export default twoc2p