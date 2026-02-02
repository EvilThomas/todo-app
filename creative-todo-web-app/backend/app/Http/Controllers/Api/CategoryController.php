<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Get all categories for the authenticated user.
     */
    public function index(Request $request)
    {
        return $request->user()->categories()->orderBy('name')->get();
    }

    /**
     * Create a new category.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
            'color' => 'required|string|size:7', // Hex code e.g. #ff0000
        ]);

        $category = $request->user()->categories()->create([
            'name' => $request->name,
            'color' => $request->color,
        ]);

        return response()->json($category, 201);
    }

    /**
     * Delete a category.
     */
    public function destroy(Request $request, Category $category)
    {
        if ($request->user()->id !== $category->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}
