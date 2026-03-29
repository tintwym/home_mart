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
        Schema::create('reviews', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('listing_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['listing_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
