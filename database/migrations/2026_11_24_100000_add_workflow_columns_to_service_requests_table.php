<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->date('scheduled_date')->nullable()->after('requested_date'); // preferred appointment
            $table->text('work_notes')->nullable()->after('resolved_date'); // written by the electrician
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['scheduled_date', 'work_notes']);
        });
    }
};
