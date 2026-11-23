<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

/**
 * In-app notice about a service request (stored in the database, shown on /notifications).
 */
class ServiceRequestUpdated extends Notification
{
    public function __construct(public string $message, public string $url) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, string> */
    public function toArray(object $notifiable): array
    {
        return ['message' => $this->message, 'url' => $this->url];
    }
}
