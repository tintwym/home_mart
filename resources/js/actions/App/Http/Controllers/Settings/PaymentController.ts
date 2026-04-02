import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\PaymentController::index
* @see app/Http/Controllers/Settings/PaymentController.php:52
* @route '/settings/payment'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings/payment',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\PaymentController::index
* @see app/Http/Controllers/Settings/PaymentController.php:52
* @route '/settings/payment'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PaymentController::index
* @see app/Http/Controllers/Settings/PaymentController.php:52
* @route '/settings/payment'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\PaymentController::index
* @see app/Http/Controllers/Settings/PaymentController.php:52
* @route '/settings/payment'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\PaymentController::store
* @see app/Http/Controllers/Settings/PaymentController.php:121
* @route '/settings/payment'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/settings/payment',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PaymentController::store
* @see app/Http/Controllers/Settings/PaymentController.php:121
* @route '/settings/payment'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PaymentController::store
* @see app/Http/Controllers/Settings/PaymentController.php:121
* @route '/settings/payment'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PaymentController::createSetupIntent
* @see app/Http/Controllers/Settings/PaymentController.php:137
* @route '/settings/payment/setup-intent'
*/
export const createSetupIntent = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSetupIntent.url(options),
    method: 'post',
})

createSetupIntent.definition = {
    methods: ["post"],
    url: '/settings/payment/setup-intent',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PaymentController::createSetupIntent
* @see app/Http/Controllers/Settings/PaymentController.php:137
* @route '/settings/payment/setup-intent'
*/
createSetupIntent.url = (options?: RouteQueryOptions) => {
    return createSetupIntent.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PaymentController::createSetupIntent
* @see app/Http/Controllers/Settings/PaymentController.php:137
* @route '/settings/payment/setup-intent'
*/
createSetupIntent.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createSetupIntent.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PaymentController::setDefault
* @see app/Http/Controllers/Settings/PaymentController.php:173
* @route '/settings/payment/default'
*/
export const setDefault = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefault.url(options),
    method: 'post',
})

setDefault.definition = {
    methods: ["post"],
    url: '/settings/payment/default',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\PaymentController::setDefault
* @see app/Http/Controllers/Settings/PaymentController.php:173
* @route '/settings/payment/default'
*/
setDefault.url = (options?: RouteQueryOptions) => {
    return setDefault.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PaymentController::setDefault
* @see app/Http/Controllers/Settings/PaymentController.php:173
* @route '/settings/payment/default'
*/
setDefault.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: setDefault.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\PaymentController::destroy
* @see app/Http/Controllers/Settings/PaymentController.php:207
* @route '/settings/payment/{paymentMethodId}'
*/
export const destroy = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/settings/payment/{paymentMethodId}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Settings\PaymentController::destroy
* @see app/Http/Controllers/Settings/PaymentController.php:207
* @route '/settings/payment/{paymentMethodId}'
*/
destroy.url = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { paymentMethodId: args }
    }

    if (Array.isArray(args)) {
        args = {
            paymentMethodId: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        paymentMethodId: args.paymentMethodId,
    }

    return destroy.definition.url
            .replace('{paymentMethodId}', parsedArgs.paymentMethodId.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\PaymentController::destroy
* @see app/Http/Controllers/Settings/PaymentController.php:207
* @route '/settings/payment/{paymentMethodId}'
*/
destroy.delete = (args: { paymentMethodId: string | number } | [paymentMethodId: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const PaymentController = { index, store, createSetupIntent, setDefault, destroy }

export default PaymentController