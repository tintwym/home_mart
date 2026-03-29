import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\ListingController::success
* @see app/Http/Controllers/ListingController.php:234
* @route '/checkout/promote/success'
*/
export const success = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

success.definition = {
    methods: ["get","head"],
    url: '/checkout/promote/success',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ListingController::success
* @see app/Http/Controllers/ListingController.php:234
* @route '/checkout/promote/success'
*/
success.url = (options?: RouteQueryOptions) => {
    return success.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::success
* @see app/Http/Controllers/ListingController.php:234
* @route '/checkout/promote/success'
*/
success.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: success.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ListingController::success
* @see app/Http/Controllers/ListingController.php:234
* @route '/checkout/promote/success'
*/
success.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: success.url(options),
    method: 'head',
})

const promote = {
    success: Object.assign(success, success),
}

export default promote