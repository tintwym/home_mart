import Api from './Api'
import ListingController from './ListingController'
import ReviewController from './ReviewController'
import ChatController from './ChatController'
import UpgradeController from './UpgradeController'
import CartController from './CartController'
import CheckoutController from './CheckoutController'
import Settings from './Settings'

const Controllers = {
    Api: Object.assign(Api, Api),
    ListingController: Object.assign(ListingController, ListingController),
    ReviewController: Object.assign(ReviewController, ReviewController),
    ChatController: Object.assign(ChatController, ChatController),
    UpgradeController: Object.assign(UpgradeController, UpgradeController),
    CartController: Object.assign(CartController, CartController),
    CheckoutController: Object.assign(CheckoutController, CheckoutController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers