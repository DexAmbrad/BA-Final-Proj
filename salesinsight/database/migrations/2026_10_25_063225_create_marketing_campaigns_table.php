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
    Schema::create('marketing_campaigns', function (Blueprint $table) {
        $table->id();
        $table->string('campaign_code')->unique();
        $table->string('campaign_name');
        $table->string('platform');
        $table->date('start_date');
        $table->date('end_date');
        $table->decimal('budget', 12, 2);
        $table->decimal('actual_spend', 12, 2);
        $table->unsignedInteger('clicks')->default(0);
        $table->unsignedInteger('conversions')->default(0);
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('marketing_campaigns');
}
};
