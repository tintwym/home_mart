<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Region (e.g. SG, MM, US) used to show seller's currency (SGD, MMK, USD).
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('region', 10)->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('region');
        });
    }
};
