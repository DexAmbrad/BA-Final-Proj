<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index()
    {
        $totalRevenue = (float) DB::table('sales')->sum('total_amount');
        $totalSales = DB::table('sales')->count();
        $totalCustomers = DB::table('customers')->count();
        $totalProducts = DB::table('products')->count();

        $lowStock = DB::table('inventories')
            ->whereColumn('stock_quantity', '<=', 'reorder_level')
            ->count();

        $monthlySales = DB::table('sales')
            ->selectRaw("DATE_FORMAT(sale_date, '%Y-%m') as month")
            ->selectRaw('SUM(total_amount) as revenue')
            ->selectRaw('COUNT(*) as transactions')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topProducts = DB::table('sales')
            ->join('products', 'sales.product_id', '=', 'products.id')
            ->select('products.name')
            ->selectRaw('SUM(sales.quantity) as units_sold')
            ->selectRaw('SUM(sales.total_amount) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        $salesByCategory = DB::table('sales')
            ->join('products', 'sales.product_id', '=', 'products.id')
            ->select('products.category')
            ->selectRaw('SUM(sales.total_amount) as revenue')
            ->groupBy('products.category')
            ->orderByDesc('revenue')
            ->get();

        $marketingByPlatform = DB::table('marketing_campaigns')
            ->select('platform')
            ->selectRaw('SUM(budget) as total_budget')
            ->selectRaw('SUM(actual_spend) as total_spend')
            ->selectRaw('SUM(clicks) as clicks')
            ->selectRaw('SUM(conversions) as conversions')
            ->groupBy('platform')
            ->orderByDesc('conversions')
            ->get();

        $inventoryAlerts = DB::table('inventories')
            ->join('products', 'inventories.product_id', '=', 'products.id')
            ->whereColumn('inventories.stock_quantity', '<=', 'inventories.reorder_level')
            ->select(
                'products.name',
                'products.category',
                'inventories.stock_quantity',
                'inventories.reorder_level'
            )
            ->orderBy('inventories.stock_quantity')
            ->limit(10)
            ->get();

        // Simple baseline forecast: average of the last 3 recorded months.
        $recentRevenues = $monthlySales->pluck('revenue')->take(-3);
        $forecastRevenue = $recentRevenues->isEmpty()
            ? 0
            : round((float) $recentRevenues->avg(), 2);

        return response()->json([
            'summary' => [
                'total_revenue' => round($totalRevenue, 2),
                'total_sales' => $totalSales,
                'total_customers' => $totalCustomers,
                'total_products' => $totalProducts,
                'low_stock_products' => $lowStock,
            ],
            'monthly_sales' => $monthlySales,
            'top_products' => $topProducts,
            'sales_by_category' => $salesByCategory,
            'marketing_by_platform' => $marketingByPlatform,
            'inventory_alerts' => $inventoryAlerts,
            'forecast' => [
                'method' => 'Average of the last 3 recorded months',
                'estimated_monthly_revenue' => $forecastRevenue,
            ],
        ]);
    }
}
