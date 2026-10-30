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
    Schema::create('sales', function (Blueprint $table) {
        $table->id();
        $table->string('transaction_code')->unique();
        $table->foreignId('customer_id')->constrained('customers');
        $table->foreignId('product_id')->constrained('products');
        $table->date('sale_date');
        $table->unsignedInteger('quantity');
        $table->decimal('unit_price', 10, 2);
        $table->decimal('total_amount', 12, 2);
        $table->string('payment_method');
        $table->timestamps();
    });
}

public function down(): void
{
    Schema::dropIfExists('sales');
}
};
