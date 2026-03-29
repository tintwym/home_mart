<?php

namespace App\Concerns;

use Illuminate\Validation\Rules\Password;

trait PasswordValidationRules
{
    /**
     * Get the validation rules used to validate passwords.
     * Requires at least 8 characters with at least one letter and one number.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function passwordRules(): array
    {
        return [
            'required',
            'string',
            'min:8',
            'regex:/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/',
            'confirmed',
        ];
    }

    /**
     * Get the validation rules used to validate the current password.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function currentPasswordRules(): array
    {
        return ['required', 'string', 'current_password'];
    }
}
