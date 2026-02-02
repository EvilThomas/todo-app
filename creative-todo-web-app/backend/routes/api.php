<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NotificationController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/todos', [TodoController::class, 'index']);
    Route::post('/todos', [TodoController::class, 'store']);
    Route::put('/todos/{id}', [TodoController::class, 'update']);
    Route::delete('/todos/{id}', [TodoController::class, 'destroy']);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    
    // User Info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Admin Routes
    Route::get('/admin/users', [AuthController::class, 'getAllUsers']);
    Route::get('/admin/users/{user}/todos', [TodoController::class, 'indexForUser']);
    Route::delete('/admin/users/{id}', [AuthController::class, 'deleteUser']);
    Route::delete('/admin/todos/{id}', [TodoController::class, 'destroyAny']);
});