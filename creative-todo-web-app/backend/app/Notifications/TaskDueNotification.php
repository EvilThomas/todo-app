<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Todo;

class TaskDueNotification extends Notification
{
    use Queueable;

    public $todo;

    /**
     * Create a new notification instance.
     */
    public function __construct(Todo $todo)
    {
        $this->todo = $todo;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'id' => $this->todo->id,
            'title' => $this->todo->title,
            'due_date' => $this->todo->due_date,
            'due_time' => $this->todo->due_time,
            'message' => "Reminder: '{$this->todo->title}' is due soon!"
        ];
    }
}
