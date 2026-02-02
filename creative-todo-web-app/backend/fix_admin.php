<?php
use App\Models\User;
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$u = User::where('email', 'admin@example.com')->first();
if ($u) {
    echo "Updating user {$u->id}...\n";
    $u->is_admin = true;
    $u->save();
    echo "Saved. New value: " . ($u->fresh()->is_admin ? 'true' : 'false') . "\n";
} else {
    echo "User not found.\n";
}
