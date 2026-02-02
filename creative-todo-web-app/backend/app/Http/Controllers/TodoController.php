<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Todo; // <--- This line causes the error if Step 1 is skipped

class TodoController extends Controller
{
    // Get all tasks for the logged-in user
    public function index()
    {
        return Todo::where('user_id', Auth::id())
                    ->orderBy('created_at', 'desc')
                    ->get();
    }

    // Create a new task
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $todo = Todo::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'is_completed' => false
        ]);

        return response()->json($todo, 201);
    }

    // Update task (toggle completion)
    public function update(Request $request, $id)
    {
        // Find the todo OR fail if it doesn't belong to the user
        $todo = Todo::where('user_id', Auth::id())->findOrFail($id);
        
        $todo->update([
            'is_completed' => $request->is_completed
        ]);

        return response()->json($todo);
    }

    // Delete task
    public function destroy($id)
    {
        $todo = Todo::where('user_id', Auth::id())->findOrFail($id);
        $todo->delete();
        
        return response()->json(['message' => 'Deleted']);
    }
}
