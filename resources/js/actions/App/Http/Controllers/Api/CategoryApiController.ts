import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
const index029b5c5da98b03e3d218bf29682b5f92 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index029b5c5da98b03e3d218bf29682b5f92.url(options),
    method: 'get',
})

index029b5c5da98b03e3d218bf29682b5f92.definition = {
    methods: ["get","head"],
    url: '/api/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
index029b5c5da98b03e3d218bf29682b5f92.url = (options?: RouteQueryOptions) => {
    return index029b5c5da98b03e3d218bf29682b5f92.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
index029b5c5da98b03e3d218bf29682b5f92.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index029b5c5da98b03e3d218bf29682b5f92.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
index029b5c5da98b03e3d218bf29682b5f92.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index029b5c5da98b03e3d218bf29682b5f92.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/mapi/categories'
*/
const indexee22910f6186137e63bef4321f962e33 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexee22910f6186137e63bef4321f962e33.url(options),
    method: 'get',
})

indexee22910f6186137e63bef4321f962e33.definition = {
    methods: ["get","head"],
    url: '/mapi/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/mapi/categories'
*/
indexee22910f6186137e63bef4321f962e33.url = (options?: RouteQueryOptions) => {
    return indexee22910f6186137e63bef4321f962e33.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/mapi/categories'
*/
indexee22910f6186137e63bef4321f962e33.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexee22910f6186137e63bef4321f962e33.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/mapi/categories'
*/
indexee22910f6186137e63bef4321f962e33.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexee22910f6186137e63bef4321f962e33.url(options),
    method: 'head',
})

export const index = {
    '/api/categories': index029b5c5da98b03e3d218bf29682b5f92,
    '/mapi/categories': indexee22910f6186137e63bef4321f962e33,
}

const CategoryApiController = { index }

export default CategoryApiController