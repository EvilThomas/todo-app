<?php

use App\Models\User;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admins = User::where('name', 'like', 'admin%')->orWhere('is_admin', true)->get();

foreach ($admins as $user) {
    echo "ID: " . $user->id . ", Name: " . $user->name . ", IsAdmin: " . ($user->is_admin ? 'YES' : 'NO') . "\n";
}
