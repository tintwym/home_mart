<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_gateway')->nullable()->after('stripe_session_id');
            $table->string('payment_reference')->nullable()->after('payment_gateway');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_gateway', 'payment_reference']);
        });
    }
};
