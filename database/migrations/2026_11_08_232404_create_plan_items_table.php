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
        Schema::create('plan_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('energy_plan_id')->constrained()->cascadeOnDelete();
            $table->foreignId('appliance_id')->constrained()->cascadeOnDelete();
            $table->decimal('planned_hours_per_day', 4, 2);
            $table->unsignedTinyInteger('priority')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_items');
    }
};
