import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\CategoryApiController::index
* @see app/Http/Controllers/Api/CategoryApiController.php:14
* @route '/api/categories'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const CategoryApiController = { index }

export default CategoryApiController