<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Spatie\LaravelPasskeys\Actions\GeneratePasskeyRegisterOptionsAction;
use Spatie\LaravelPasskeys\Actions\StorePasskeyAction;
use Spatie\LaravelPasskeys\Models\Passkey;
use Throwable;

class PasskeyController extends Controller
{
    public function registerOptions(Request $request): JsonResponse
    {
        $user = $request->user();

        $json = app(GeneratePasskeyRegisterOptionsAction::class)->execute($user, true);
        $decoded = json_decode($json, true);

        return response()->json($decoded);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'passkey' => ['required', 'json'],
            'options' => ['required', 'json'],
            'name' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            app(StorePasskeyAction::class)->execute(
                $request->user(),
                $data['passkey'],
                $data['options'],
                $request->getHost(),
                ['name' => $data['name'] ?? 'Passkey'],
            );
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'passkey' => __('passkeys::passkeys.error_something_went_wrong_generating_the_passkey'),
            ]);
        }

        return redirect()->back()->with('status', 'Passkey added.');
    }

    public function destroy(Request $request, Passkey $passkey): RedirectResponse
    {
        abort_unless($passkey->authenticatable_id === $request->user()->id, 403);

        $passkey->delete();

        return redirect()->back()->with('status', 'Passkey removed.');
    }
}
