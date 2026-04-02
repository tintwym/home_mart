import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:12
* @route '/api/register'
*/
const register081b1c69c5c56495bfbc4baf15cc7ab2 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
    method: 'post',
})

register081b1c69c5c56495bfbc4baf15cc7ab2.definition = {
    methods: ["post"],
    url: '/api/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:12
* @route '/api/register'
*/
register081b1c69c5c56495bfbc4baf15cc7ab2.url = (options?: RouteQueryOptions) => {
    return register081b1c69c5c56495bfbc4baf15cc7ab2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:12
* @route '/api/register'
*/
register081b1c69c5c56495bfbc4baf15cc7ab2.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register081b1c69c5c56495bfbc4baf15cc7ab2.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:12
* @route '/mapi/register'
*/
const register9a563aa85aa9a995d69c20bb91069ce3 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register9a563aa85aa9a995d69c20bb91069ce3.url(options),
    method: 'post',
})

register9a563aa85aa9a995d69c20bb91069ce3.definition = {
    methods: ["post"],
    url: '/mapi/register',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:12
* @route '/mapi/register'
*/
register9a563aa85aa9a995d69c20bb91069ce3.url = (options?: RouteQueryOptions) => {
    return register9a563aa85aa9a995d69c20bb91069ce3.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::register
* @see app/Http/Controllers/Api/AuthController.php:12
* @route '/mapi/register'
*/
register9a563aa85aa9a995d69c20bb91069ce3.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: register9a563aa85aa9a995d69c20bb91069ce3.url(options),
    method: 'post',
})

export const register = {
    '/api/register': register081b1c69c5c56495bfbc4baf15cc7ab2,
    '/mapi/register': register9a563aa85aa9a995d69c20bb91069ce3,
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:33
* @route '/api/login'
*/
const login864070da724d26d80017528ac19e2893 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login864070da724d26d80017528ac19e2893.url(options),
    method: 'post',
})

login864070da724d26d80017528ac19e2893.definition = {
    methods: ["post"],
    url: '/api/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:33
* @route '/api/login'
*/
login864070da724d26d80017528ac19e2893.url = (options?: RouteQueryOptions) => {
    return login864070da724d26d80017528ac19e2893.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:33
* @route '/api/login'
*/
login864070da724d26d80017528ac19e2893.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login864070da724d26d80017528ac19e2893.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:33
* @route '/mapi/login'
*/
const login4478902e93e558620ce4c8696aa2b3c4 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login4478902e93e558620ce4c8696aa2b3c4.url(options),
    method: 'post',
})

login4478902e93e558620ce4c8696aa2b3c4.definition = {
    methods: ["post"],
    url: '/mapi/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:33
* @route '/mapi/login'
*/
login4478902e93e558620ce4c8696aa2b3c4.url = (options?: RouteQueryOptions) => {
    return login4478902e93e558620ce4c8696aa2b3c4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AuthController::login
* @see app/Http/Controllers/Api/AuthController.php:33
* @route '/mapi/login'
*/
login4478902e93e558620ce4c8696aa2b3c4.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login4478902e93e558620ce4c8696aa2b3c4.url(options),
    method: 'post',
})

export const login = {
    '/api/login': login864070da724d26d80017528ac19e2893,
    '/mapi/login': login4478902e93e558620ce4c8696aa2b3c4,
}

const AuthController = { register, login }

export default AuthController