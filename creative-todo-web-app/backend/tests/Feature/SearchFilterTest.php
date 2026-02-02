<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchFilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_search_todos()
    {
        $user = User::factory()->create();
        Todo::create(['user_id' => $user->id, 'title' => 'Buy Milk', 'is_completed' => false]);
        Todo::create(['user_id' => $user->id, 'title' => 'Walk Dog', 'is_completed' => false]);

        $response = $this->actingAs($user)->getJson('/api/todos?search=Milk');

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['title' => 'Buy Milk']);
    }

    public function test_can_filter_by_status()
    {
        $user = User::factory()->create();
        Todo::create(['user_id' => $user->id, 'title' => 'Pending Task', 'is_completed' => false]);
        Todo::create(['user_id' => $user->id, 'title' => 'Done Task', 'is_completed' => true]);

        // Filter Completed
        $response = $this->actingAs($user)->getJson('/api/todos?is_completed=true');
        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['title' => 'Done Task']);

        // Filter Pending
        $response = $this->actingAs($user)->getJson('/api/todos?is_completed=false');
        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['title' => 'Pending Task']);
    }

    public function test_can_filter_by_category()
    {
        $user = User::factory()->create();
        $cat1 = Category::create(['user_id' => $user->id, 'name' => 'Work', 'color' => '#000000']);
        $cat2 = Category::create(['user_id' => $user->id, 'name' => 'Home', 'color' => '#ffffff']);

        Todo::create(['user_id' => $user->id, 'title' => 'Work Task', 'is_completed' => false, 'category_id' => $cat1->id]);
        Todo::create(['user_id' => $user->id, 'title' => 'Home Task', 'is_completed' => false, 'category_id' => $cat2->id]);

        $response = $this->actingAs($user)->getJson("/api/todos?category_id={$cat1->id}");

        $response->assertStatus(200)
                 ->assertJsonCount(1)
                 ->assertJsonFragment(['title' => 'Work Task']);
    }
}
