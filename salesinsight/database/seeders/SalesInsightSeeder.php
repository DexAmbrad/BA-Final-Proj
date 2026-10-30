<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalesInsightSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // Clear sample records in dependency order.
            DB::table('inventories')->delete();
            DB::table('sales')->delete();
            DB::table('marketing_campaigns')->delete();
            DB::table('products')->delete();
            DB::table('customers')->delete();

            $cities = [
                'Cebu City', 'Danao', 'Lapu-Lapu', 'Mandaue',
                'Dumaguete', 'Tagbilaran', 'Bacolod', 'Iloilo City',
                'Dipolog', 'Dapitan'
            ];

            $types = ['Regular', 'VIP', 'New'];

            // 50 customers
            for ($i = 1; $i <= 50; $i++) {
                DB::table('customers')->insert([
                    'customer_code' => sprintf('CUS-%03d', $i),
                    'full_name' => "Customer $i",
                    'email' => "customer$i@example.com",
                    'city' => $cities[($i - 1) % count($cities)],
                    'customer_type' => $types[($i - 1) % 3],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 50 products
            $categories = [
                'Audio', 'Chargers', 'Keyboards',
                'Phone Cases', 'Accessories'
            ];

            for ($i = 1; $i <= 50; $i++) {
                $cost = 100 + (($i * 37) % 900);

                DB::table('products')->insert([
                    'product_code' => sprintf('PRD-%03d', $i),
                    'name' => $categories[($i - 1) % 5] . " Product $i",
                    'category' => $categories[($i - 1) % 5],
                    'price' => round($cost * 1.45, 2),
                    'cost_price' => $cost,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 50 marketing campaigns
            $platforms = [
                'Facebook', 'TikTok', 'Instagram',
                'Google Ads', 'Email'
            ];

            for ($i = 1; $i <= 50; $i++) {
                $start = now()->subDays(50 - ($i % 45))->startOfDay();

                DB::table('marketing_campaigns')->insert([
                    'campaign_code' => sprintf('CAM-%03d', $i),
                    'campaign_name' => "Campaign $i",
                    'platform' => $platforms[($i - 1) % 5],
                    'start_date' => $start->toDateString(),
                    'end_date' => $start->copy()->addDays(6)->toDateString(),
                    'budget' => 1000 + (($i * 250) % 5000),
                    'actual_spend' => 800 + (($i * 173) % 4000),
                    'clicks' => 100 + (($i * 47) % 2000),
                    'conversions' => 5 + (($i * 7) % 100),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Read the actual IDs so foreign keys remain correct.
            $customerIds = DB::table('customers')->orderBy('id')->pluck('id')->all();
            $products = DB::table('products')->orderBy('id')->get();

            // 100 sales transactions
            for ($i = 1; $i <= 100; $i++) {
                $customerId = $customerIds[($i * 7 - 1) % count($customerIds)];
                $product = $products[($i * 13 - 1) % count($products)];
                $quantity = 1 + (($i * 3) % 5);
                $price = (float) $product->price;

                DB::table('sales')->insert([
                    'transaction_code' => sprintf('SAL-%04d', $i),
                    'customer_id' => $customerId,
                    'product_id' => $product->id,
                    'sale_date' => now()->subDays(($i * 3) % 180)->toDateString(),
                    'quantity' => $quantity,
                    'unit_price' => $price,
                    'total_amount' => round($price * $quantity, 2),
                    'payment_method' => ['Cash', 'GCash', 'Card'][($i - 1) % 3],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 50 inventory records
            foreach ($products as $i => $product) {
                $number = $i + 1;

                DB::table('inventories')->insert([
                    'product_id' => $product->id,
                    'location' => 'Store ' . (1 + ($i % 3)),
                    'stock_quantity' => ($number * 17) % 80,
                    'reorder_level' => 10 + ($number % 15),
                    'last_restocked_at' => now()->subDays($number % 30)->toDateString(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }
}
