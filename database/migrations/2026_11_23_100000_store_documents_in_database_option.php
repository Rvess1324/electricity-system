<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('electrician_documents', function (Blueprint $table) {
            // Base64 file contents, used when DOCUMENTS_DISK=database (no file storage service needed)
            $table->longText('contents')->nullable();
            $table->string('path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('electrician_documents', function (Blueprint $table) {
            $table->dropColumn('contents');
        });
    }
};
