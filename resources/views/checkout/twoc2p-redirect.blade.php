<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Redirecting to payment…</title>
</head>
<body>
    <p>Redirecting to secure payment…</p>
    <form id="twoc2p-pay" method="POST" action="{{ $webPaymentUrl }}">
        <input type="hidden" name="paymentToken" value="{{ $paymentToken }}">
    </form>
    <script>document.getElementById('twoc2p-pay').submit();</script>
</body>
</html>
