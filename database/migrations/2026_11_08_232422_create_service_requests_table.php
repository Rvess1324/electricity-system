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
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained()->cascadeOnDelete();
            $table->foreignId('meter_id')->constrained()->cascadeOnDelete();
            $table->foreignId('electrician_id')->nullable()->constrained()->nullOnDelete(); // empty until assigned
            $table->text('issue_description');
            $table->string('status', 20)->default('pending'); // pending, assigned, resolved
            $table->date('requested_date');
            $table->date('resolved_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
