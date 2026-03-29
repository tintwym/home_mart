import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\UpgradeController::index
* @see app/Http/Controllers/UpgradeController.php:13
* @route '/upgrades'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/upgrades',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UpgradeController::index
* @see app/Http/Controllers/UpgradeController.php:13
* @route '/upgrades'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpgradeController::index
* @see app/Http/Controllers/UpgradeController.php:13
* @route '/upgrades'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UpgradeController::index
* @see app/Http/Controllers/UpgradeController.php:13
* @route '/upgrades'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UpgradeController::slots
* @see app/Http/Controllers/UpgradeController.php:34
* @route '/upgrades/slots'
*/
export const slots = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: slots.url(options),
    method: 'post',
})

slots.definition = {
    methods: ["post"],
    url: '/upgrades/slots',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UpgradeController::slots
* @see app/Http/Controllers/UpgradeController.php:34
* @route '/upgrades/slots'
*/
slots.url = (options?: RouteQueryOptions) => {
    return slots.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpgradeController::slots
* @see app/Http/Controllers/UpgradeController.php:34
* @route '/upgrades/slots'
*/
slots.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: slots.url(options),
    method: 'post',
})

const upgrades = {
    index: Object.assign(index, index),
    slots: Object.assign(slots, slots),
}

export default upgrades