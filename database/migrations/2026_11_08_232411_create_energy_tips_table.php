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
        Schema::create('energy_tips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 100);
            $table->text('description');
            $table->string('category', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('energy_tips');
    }
};
