import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\UpgradeController::purchaseSlots
* @see app/Http/Controllers/UpgradeController.php:34
* @route '/upgrades/slots'
*/
export const purchaseSlots = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchaseSlots.url(options),
    method: 'post',
})

purchaseSlots.definition = {
    methods: ["post"],
    url: '/upgrades/slots',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UpgradeController::purchaseSlots
* @see app/Http/Controllers/UpgradeController.php:34
* @route '/upgrades/slots'
*/
purchaseSlots.url = (options?: RouteQueryOptions) => {
    return purchaseSlots.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UpgradeController::purchaseSlots
* @see app/Http/Controllers/UpgradeController.php:34
* @route '/upgrades/slots'
*/
purchaseSlots.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: purchaseSlots.url(options),
    method: 'post',
})

const UpgradeController = { index, purchaseSlots }

export default UpgradeController