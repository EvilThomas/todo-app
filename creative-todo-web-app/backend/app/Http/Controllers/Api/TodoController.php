<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Todo;

class TodoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->user()->todos()->with('category')->latest();

        // Search by Title
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by Status
        if ($request->has('is_completed') && $request->is_completed !== 'all') {
            $status = filter_var($request->is_completed, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_completed', $status);
        }

        // Filter by Category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        return $query->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $todo = $request->user()->todos()->create([
            'title' => $request->title,
            'is_completed' => false,
            'due_date' => $request->due_date,
            'due_time' => $request->due_time,
            'category_id' => $request->category_id,
        ]);

        return response()->json($todo->load('category'), 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $todo = $request->user()->todos()->findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'is_completed' => 'sometimes|boolean',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|string', // Or date_format:H:i if strictly time
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $todo->update($request->only(['title', 'is_completed', 'due_date', 'due_time', 'category_id']));

        return response()->json($todo->load('category'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $todo = $request->user()->todos()->findOrFail($id);
        $todo->delete();

        return response()->json(['message' => 'Todo deleted successfully']);
    }
    /**
     * Admin: Get todos for a specific user.
     */
    public function indexForUser(Request $request, $userId)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return Todo::where('user_id', $userId)->latest()->get();
    }

    /**
     * Admin: Delete any todo.
     */
    public function destroyAny(Request $request, string $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $todo = Todo::findOrFail($id);
        $todo->delete();

        return response()->json(['message' => 'Todo deleted successfully (Admin)']);
    }
}
