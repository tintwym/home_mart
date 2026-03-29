import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\SettingsMenuController::index
* @see app/Http/Controllers/Settings/SettingsMenuController.php:14
* @route '/settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\SettingsMenuController::index
* @see app/Http/Controllers/Settings/SettingsMenuController.php:14
* @route '/settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\SettingsMenuController::index
* @see app/Http/Controllers/Settings/SettingsMenuController.php:14
* @route '/settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\SettingsMenuController::index
* @see app/Http/Controllers/Settings/SettingsMenuController.php:14
* @route '/settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const settings = {
    index: Object.assign(index, index),
}

export default settings