<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->index(['buyer_id', 'updated_at']);
        });
        Schema::table('messages', function (Blueprint $table) {
            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex(['buyer_id', 'updated_at']);
        });
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex(['conversation_id', 'created_at']);
        });
    }
};
