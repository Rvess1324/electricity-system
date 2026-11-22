<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('electricians', function (Blueprint $table) {
            $table->string('phone_no', 20)->nullable();
            $table->string('address')->nullable();
            $table->string('qualification_type', 20)->nullable();
            $table->unsignedSmallInteger('years_experience')->nullable();
            $table->string('service_area')->nullable();
            $table->text('previous_work')->nullable();

            // Existing and admin-created electricians are approved; self-registered ones start as pending
            $table->string('status', 20)->default('approved');
            $table->text('status_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('electricians', function (Blueprint $table) {
            $table->dropColumn([
                'phone_no', 'address', 'qualification_type', 'years_experience', 'service_area',
                'previous_work', 'status', 'status_reason', 'reviewed_at', 'reviewed_by',
            ]);
        });
    }
};
