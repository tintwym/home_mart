import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import reviews from './reviews'
import chat from './chat'
import promote562205 from './promote'
import cart from './cart'
/**
* @see \App\Http\Controllers\ListingController::create
* @see app/Http/Controllers/ListingController.php:58
* @route '/listings/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/listings/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ListingController::create
* @see app/Http/Controllers/ListingController.php:58
* @route '/listings/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::create
* @see app/Http/Controllers/ListingController.php:58
* @route '/listings/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ListingController::create
* @see app/Http/Controllers/ListingController.php:58
* @route '/listings/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ListingController::edit
* @see app/Http/Controllers/ListingController.php:115
* @route '/listings/{listing}/edit'
*/
export const edit = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/listings/{listing}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ListingController::edit
* @see app/Http/Controllers/ListingController.php:115
* @route '/listings/{listing}/edit'
*/
edit.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { listing: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { listing: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            listing: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        listing: typeof args.listing === 'object'
        ? args.listing.id
        : args.listing,
    }

    return edit.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::edit
* @see app/Http/Controllers/ListingController.php:115
* @route '/listings/{listing}/edit'
*/
edit.get = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ListingController::edit
* @see app/Http/Controllers/ListingController.php:115
* @route '/listings/{listing}/edit'
*/
edit.head = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ListingController::show
* @see app/Http/Controllers/ListingController.php:22
* @route '/listings/{listing}'
*/
export const show = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/listings/{listing}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ListingController::show
* @see app/Http/Controllers/ListingController.php:22
* @route '/listings/{listing}'
*/
show.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { listing: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { listing: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            listing: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        listing: typeof args.listing === 'object'
        ? args.listing.id
        : args.listing,
    }

    return show.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::show
* @see app/Http/Controllers/ListingController.php:22
* @route '/listings/{listing}'
*/
show.get = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ListingController::show
* @see app/Http/Controllers/ListingController.php:22
* @route '/listings/{listing}'
*/
show.head = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ListingController::promote
* @see app/Http/Controllers/ListingController.php:191
* @route '/listings/{listing}/promote'
*/
export const promote = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promote.url(args, options),
    method: 'post',
})

promote.definition = {
    methods: ["post"],
    url: '/listings/{listing}/promote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ListingController::promote
* @see app/Http/Controllers/ListingController.php:191
* @route '/listings/{listing}/promote'
*/
promote.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { listing: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { listing: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            listing: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        listing: typeof args.listing === 'object'
        ? args.listing.id
        : args.listing,
    }

    return promote.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::promote
* @see app/Http/Controllers/ListingController.php:191
* @route '/listings/{listing}/promote'
*/
promote.post = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: promote.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ListingController::store
* @see app/Http/Controllers/ListingController.php:79
* @route '/listings'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/listings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ListingController::store
* @see app/Http/Controllers/ListingController.php:79
* @route '/listings'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::store
* @see app/Http/Controllers/ListingController.php:79
* @route '/listings'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ListingController::update
* @see app/Http/Controllers/ListingController.php:128
* @route '/listings/{listing}'
*/
export const update = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/listings/{listing}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\ListingController::update
* @see app/Http/Controllers/ListingController.php:128
* @route '/listings/{listing}'
*/
update.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { listing: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { listing: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            listing: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        listing: typeof args.listing === 'object'
        ? args.listing.id
        : args.listing,
    }

    return update.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::update
* @see app/Http/Controllers/ListingController.php:128
* @route '/listings/{listing}'
*/
update.put = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\ListingController::update
* @see app/Http/Controllers/ListingController.php:128
* @route '/listings/{listing}'
*/
update.patch = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\ListingController::destroy
* @see app/Http/Controllers/ListingController.php:167
* @route '/listings/{listing}'
*/
export const destroy = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/listings/{listing}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\ListingController::destroy
* @see app/Http/Controllers/ListingController.php:167
* @route '/listings/{listing}'
*/
destroy.url = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { listing: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { listing: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            listing: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        listing: typeof args.listing === 'object'
        ? args.listing.id
        : args.listing,
    }

    return destroy.definition.url
            .replace('{listing}', parsedArgs.listing.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ListingController::destroy
* @see app/Http/Controllers/ListingController.php:167
* @route '/listings/{listing}'
*/
destroy.delete = (args: { listing: string | { id: string } } | [listing: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const listings = {
    create: Object.assign(create, create),
    edit: Object.assign(edit, edit),
    show: Object.assign(show, show),
    reviews: Object.assign(reviews, reviews),
    chat: Object.assign(chat, chat),
    promote: Object.assign(promote, promote562205),
    cart: Object.assign(cart, cart),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default listings