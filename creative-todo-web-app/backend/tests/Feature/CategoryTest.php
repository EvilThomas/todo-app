<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_category()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
                         ->postJson('/api/categories', [
                             'name' => 'Work',
                             'color' => '#0000ff'
                         ]);

        $response->assertStatus(201)
                 ->assertJson([
                     'name' => 'Work',
                     'color' => '#0000ff'
                 ]);

        $this->assertDatabaseHas('categories', [
            'name' => 'Work',
            'user_id' => $user->id
        ]);
    }

    public function test_can_fetch_categories()
    {
        $user = User::factory()->create();
        Category::create(['user_id' => $user->id, 'name' => 'Cat 1', 'color' => '#000000']);
        Category::create(['user_id' => $user->id, 'name' => 'Cat 2', 'color' => '#ffffff']);

        $response = $this->actingAs($user)->getJson('/api/categories');

        $response->assertStatus(200)
                 ->assertJsonCount(2);
    }

    public function test_can_delete_category()
    {
        $user = User::factory()->create();
        $category = Category::create(['user_id' => $user->id, 'name' => 'To Delete', 'color' => '#000000']);

        $response = $this->actingAs($user)->deleteJson("/api/categories/{$category->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }

    public function test_deleting_category_sets_todo_category_id_to_null()
    {
        $user = User::factory()->create();
        $category = Category::create(['user_id' => $user->id, 'name' => 'Work', 'color' => '#0000ff']);
        $todo = Todo::create([
            'user_id' => $user->id, 
            'title' => 'Task 1', 
            'is_completed' => false,
            'category_id' => $category->id
        ]);

        $this->actingAs($user)->deleteJson("/api/categories/{$category->id}");

        $todo->refresh();
        $this->assertNull($todo->category_id);
    }
}
