import AuthController from './AuthController'
import CategoryApiController from './CategoryApiController'
import ListingApiController from './ListingApiController'

const Api = {
    AuthController: Object.assign(AuthController, AuthController),
    CategoryApiController: Object.assign(CategoryApiController, CategoryApiController),
    ListingApiController: Object.assign(ListingApiController, ListingApiController),
}

export default Api