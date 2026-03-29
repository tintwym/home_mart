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
        Schema::create('listings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            // Correctly link to the ULID user and category
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('category_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('condition'); // Used for your "Deal" logic
            $table->decimal('price', 10, 2);
            $table->string('image_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
