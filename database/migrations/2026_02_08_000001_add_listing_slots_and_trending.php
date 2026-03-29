<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('extra_listing_slots')->default(0)->after('seller_type');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->timestamp('trending_until')->nullable()->after('meetup_location');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('extra_listing_slots');
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn('trending_until');
        });
    }
};
