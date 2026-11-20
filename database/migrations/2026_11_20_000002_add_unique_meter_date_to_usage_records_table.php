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
     * One reading per meter per day. Existing duplicates are merged by summing
     * them into the oldest row, so the totals households already see on their
     * dashboards and plans do not change.
     */
    public function up(): void
    {
        DB::transaction(function () {
            $duplicates = DB::table('usage_records')
                ->select('meter_id', 'usage_date')
                ->selectRaw('MIN(id) as keep_id, SUM(kwh_used) as kwh, SUM(estimated_cost) as cost')
                ->groupBy('meter_id', 'usage_date')
                ->havingRaw('COUNT(*) > 1')
                ->get();

            foreach ($duplicates as $group) {
                DB::table('usage_records')
                    ->where('id', $group->keep_id)
                    ->update(['kwh_used' => $group->kwh, 'estimated_cost' => $group->cost]);

                DB::table('usage_records')
                    ->where('meter_id', $group->meter_id)
                    ->where('usage_date', $group->usage_date)
                    ->where('id', '!=', $group->keep_id)
                    ->delete();
            }
        });

        Schema::table('usage_records', function (Blueprint $table) {
            $table->unique(['meter_id', 'usage_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usage_records', function (Blueprint $table) {
            $table->dropUnique(['meter_id', 'usage_date']);
        });
    }
};
