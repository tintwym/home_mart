<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fix sessions table to match Laravel's database session driver schema.
     */
    public function up(): void
    {
        Schema::dropIfExists('sessions');

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUlid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');

        // Recreate the minimal table from the original migration
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
};
