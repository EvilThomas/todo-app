<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use App\Notifications\TaskDueNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_fetch_notifications()
    {
        $user = User::factory()->create();
        $todo = Todo::create(['user_id' => $user->id, 'title' => 'Test Task', 'is_completed' => false]);
        
        // Manually trigger notification
        $user->notify(new TaskDueNotification($todo));

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    public function test_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $todo = Todo::create(['user_id' => $user->id, 'title' => 'Test Task', 'is_completed' => false]);
        $user->notify(new TaskDueNotification($todo));

        $notification = $user->unreadNotifications->first();

        $response = $this->actingAs($user)->putJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200);
        $this->assertEquals(0, $user->fresh()->unreadNotifications->count());
    }

    public function test_command_sends_notification_for_due_tasks()
    {
        Notification::fake();

        $user = User::factory()->create();
        $todo = Todo::create([
            'user_id' => $user->id, 
            'title' => 'Due Task', 
            'is_completed' => false,
            'due_date' => now()->addHours(2)->toDateString(),
            'due_time' => now()->addHours(2)->format('H:i')
        ]);

        $this->artisan('app:check-due-tasks')
             ->assertExitCode(0);

        Notification::assertSentTo(
            [$user], TaskDueNotification::class
        );
    }
}
