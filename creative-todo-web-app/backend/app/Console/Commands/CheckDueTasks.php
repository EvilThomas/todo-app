<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\TaskDueNotification;
use Carbon\Carbon;

class CheckDueTasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-due-tasks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for tasks due in the next 24 hours and notify users';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();
        $next24Hours = Carbon::now()->addHours(24);

        $todos = Todo::with('user')
            ->where('is_completed', false)
            ->whereBetween('due_date', [$now->toDateString(), $next24Hours->toDateString()])
            ->get();

        foreach ($todos as $todo) {
            // Logic to avoid spamming: Check if notification already exists for this todo today
            // For simplicity in this demo, we'll check if the user has unread notifications for this task ID.
            // In a real app, you might add a 'notified_at' column to Todos or a separate pivot table.
            
            $alreadyNotified = $todo->user->unreadNotifications
                ->where('data.id', $todo->id)
                ->isNotEmpty();

            if (!$alreadyNotified) {
                $todo->user->notify(new TaskDueNotification($todo));
                $this->info("Notified user {$todo->user_id} for task {$todo->title}");
            }
        }

        $this->info('Due task check complete.');
    }
}
