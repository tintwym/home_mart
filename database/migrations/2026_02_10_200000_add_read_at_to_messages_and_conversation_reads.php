<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->timestamp('read_at')->nullable()->after('body');
        });

        Schema::create('conversation_reads', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('conversation_id')->constrained()->onDelete('cascade');
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();
            $table->unique(['conversation_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn('read_at');
        });
        Schema::dropIfExists('conversation_reads');
    }
};
