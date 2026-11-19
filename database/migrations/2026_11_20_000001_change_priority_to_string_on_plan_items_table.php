<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The app stores 'high' | 'medium' | 'low', which MySQL and Postgres
     * reject in an unsigned tiny integer column.
     */
    public function up(): void
    {
        Schema::table('plan_items', function (Blueprint $table) {
            $table->string('priority', 10)->default('medium')->change();
        });

        // Any leftover numeric value from the old column becomes a valid label.
        DB::table('plan_items')
            ->whereNotIn('priority', ['high', 'medium', 'low'])
            ->update(['priority' => 'medium']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (['high' => '3', 'medium' => '2', 'low' => '1'] as $label => $number) {
            DB::table('plan_items')->where('priority', $label)->update(['priority' => $number]);
        }

        Schema::table('plan_items', function (Blueprint $table) {
            $table->unsignedTinyInteger('priority')->default(1)->change();
        });
    }
};
