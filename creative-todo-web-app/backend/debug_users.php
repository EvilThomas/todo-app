<?php

use App\Models\User;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = User::orderBy('created_at', 'desc')->take(2)->get();

foreach ($users as $user) {
    try {
        $info = password_get_info($user->password);
        echo json_encode([
            'name' => $user->name,
            'email' => $user->email,
            'password_start' => substr($user->password, 0, 10),
            'algo' => $info['algo'],
            'algoName' => $info['algoName']
        ]) . "\n";
    } catch (\Throwable $e) {
        echo "Error: " . $e->getMessage();
    }
}
