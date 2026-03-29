<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('listing_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('buyer_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['listing_id', 'buyer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
