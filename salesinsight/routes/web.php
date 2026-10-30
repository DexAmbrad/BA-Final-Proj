<?php

use App\Http\Controllers\Api\AnalyticsController;
use Illuminate\Support\Facades\Route;

Route::get('/api/analytics', [AnalyticsController::class, 'index']);
Route::get('/', function () {
    return view('welcome');
});
