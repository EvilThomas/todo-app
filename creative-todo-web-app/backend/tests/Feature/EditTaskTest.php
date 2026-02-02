<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditTaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_todo_can_be_updated_with_date_and_time()
    {
        $user = User::factory()->create();
        $todo = Todo::create([
            'user_id' => $user->id,
            'title' => 'Original Title',
            'is_completed' => false,
        ]);

        $response = $this->actingAs($user)
                         ->putJson("/api/todos/{$todo->id}", [
                             'title' => 'Updated Title',
                             'due_date' => '2023-12-31',
                             'due_time' => '14:30',
                         ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'title' => 'Updated Title',
                     'due_date' => '2023-12-31',
                     'due_time' => '14:30',
                 ]);

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated Title',
            'due_date' => '2023-12-31',
            'due_time' => '14:30',
        ]);
    }

    public function test_cannot_update_other_users_todo()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $todo = Todo::create([
            'user_id' => $user1->id,
            'title' => 'User 1 Todo',
            'is_completed' => false,
        ]);

        $response = $this->actingAs($user2)
                         ->putJson("/api/todos/{$todo->id}", [
                             'title' => 'Hacked Title',
                         ]);

        $response->assertStatus(404); // Or 403 depending on implementation, usually Laravel default is 404 for model binding
    }
}
