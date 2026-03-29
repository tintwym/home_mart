<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Http;

class TwoC2pService
{
    protected string $merchantId;

    protected string $secretKey;

    protected string $paymentTokenUrl;

    public function __construct()
    {
        $this->merchantId = config('services.2c2p.merchant_id', '');
        $this->secretKey = config('services.2c2p.secret_key', '');
        $this->paymentTokenUrl = config('services.2c2p.payment_token_url', 'https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken');
    }

    public function isConfigured(): bool
    {
        return ! empty($this->merchantId) && ! empty($this->secretKey);
    }

    /**
     * Get payment token and redirect URL for 2c2p hosted payment page.
     *
     * @return array{webPaymentUrl: string, paymentToken: string}|null
     */
    public function createPaymentToken(
        string $invoiceNo,
        float $amount,
        string $currencyCode,
        string $description,
        string $frontendReturnUrl,
        string $backendReturnUrl,
        ?string $orderId = null
    ): ?array {
        if (! $this->isConfigured()) {
            return null;
        }

        $payload = [
            'merchantID' => $this->merchantId,
            'invoiceNo' => $invoiceNo,
            'description' => $description,
            'amount' => round($amount, 2),
            'currencyCode' => $currencyCode,
            'paymentChannel' => ['CC', 'IPP', 'MPU', 'APM'],
            'frontendReturnUrl' => $frontendReturnUrl,
            'backendReturnUrl' => $backendReturnUrl,
            'locale' => 'en',
        ];

        if ($orderId) {
            $payload['userDefined1'] = $orderId;
        }

        $token = JWT::encode($payload, $this->secretKey, 'HS256');

        $response = Http::timeout(15)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($this->paymentTokenUrl, ['payload' => $token]);

        if (! $response->successful()) {
            return null;
        }

        $data = $response->json();
        $responsePayload = $data['payload'] ?? null;

        if (! $responsePayload) {
            return null;
        }

        try {
            $decoded = JWT::decode($responsePayload, new Key($this->secretKey, 'HS256'));
            $decodedArray = (array) $decoded;

            if (($decodedArray['respCode'] ?? '') !== '0000') {
                return null;
            }

            return [
                'webPaymentUrl' => $decodedArray['webPaymentUrl'] ?? '',
                'paymentToken' => $decodedArray['paymentToken'] ?? '',
            ];
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Decode 2c2p callback/return payload.
     *
     * @return array<string, mixed>|null
     */
    public function decodePayload(string $payload): ?array
    {
        try {
            $decoded = JWT::decode($payload, new Key($this->secretKey, 'HS256'));

            return (array) $decoded;
        } catch (\Throwable) {
            return null;
        }
    }
}
