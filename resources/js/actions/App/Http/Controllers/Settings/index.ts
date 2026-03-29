import SettingsMenuController from './SettingsMenuController'
import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import TwoFactorAuthenticationController from './TwoFactorAuthenticationController'
import PaymentController from './PaymentController'

const Settings = {
    SettingsMenuController: Object.assign(SettingsMenuController, SettingsMenuController),
    ProfileController: Object.assign(ProfileController, ProfileController),
    PasswordController: Object.assign(PasswordController, PasswordController),
    TwoFactorAuthenticationController: Object.assign(TwoFactorAuthenticationController, TwoFactorAuthenticationController),
    PaymentController: Object.assign(PaymentController, PaymentController),
}

export default Settings