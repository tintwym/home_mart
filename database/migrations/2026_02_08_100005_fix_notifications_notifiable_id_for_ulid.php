<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropMorphs('notifiable');
        });
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('notifiable_type')->after('type');
            $table->ulid('notifiable_id')->after('notifiable_type');
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['notifiable_type', 'notifiable_id']);
            $table->dropColumn(['notifiable_id', 'notifiable_type']);
        });
        Schema::table('notifications', function (Blueprint $table) {
            $table->morphs('notifiable');
        });
    }
};
