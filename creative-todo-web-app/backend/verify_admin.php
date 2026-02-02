<?php

use App\Models\User;
use App\Models\Todo;
use Illuminate\Http\Request;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$adminEmail = 'admin@example.com';
$userEmail = 'test@example.com';

echo "=== Verifying Admin Dashboard Features ===\n";

// 1. Get Admin User
$admin = User::where('email', $adminEmail)->first();
if (!$admin) {
    echo "Admin user not found.\n";
    exit(1);
}
echo "Admin found. is_admin value: " . var_export($admin->is_admin, true) . "\n";

if (!$admin->is_admin) {
    echo "Admin user is not set as admin.\n";
    // Check if it's 1 but treated as false?
    exit(1);
}

// 2. Ensure a regular user and task exists
$user = User::where('email', $userEmail)->first();
if (!$user) {
    echo "Creating test user...\n";
    $user = User::factory()->create(['email' => $userEmail, 'password' => 'password', 'is_admin' => false]);
}
$todo = $user->todos()->create(['title' => 'Task to be deleted by Admin']);
echo "Created test task: " . $todo->id . " for user " . $user->id . "\n";

// Create token for admin
$adminToken = $admin->createToken('admin-test')->plainTextToken;

// 3. Test GET /api/admin/users
echo "\n--- Testing Get All Users ---\n";
$req1 = Request::create('/api/admin/users', 'GET');
$req1->headers->set('Authorization', 'Bearer ' . $adminToken);
$req1->headers->set('Accept', 'application/json');
$res1 = $app->handle($req1);
if ($res1->status() === 200) {
    echo "Success! Users count: " . count(json_decode($res1->getContent())) . "\n";
} else {
    echo "Failed: " . $res1->status() . " (Error content suppressed)\n";
}

// 4. Test GET /api/admin/users/{id}/todos
echo "\n--- Testing Get User Todos ---\n";
$req2 = Request::create("/api/admin/users/{$user->id}/todos", 'GET');
$req2->setUserResolver(function () use ($admin) { return $admin; });
$res2 = $app->handle($req2);
if ($res2->status() === 200) {
    echo "Success! Todos count: " . count(json_decode($res2->getContent())) . "\n";
} else {
    echo "Failed: " . $res2->status() . " " . $res2->getContent() . "\n";
}

// 5. Test DELETE /api/admin/todos/{id}
echo "\n--- Testing Delete Todo ---\n";
$req3 = Request::create("/api/admin/todos/{$todo->id}", 'DELETE');
$req3->setUserResolver(function () use ($admin) { return $admin; });
$res3 = $app->handle($req3);
if ($res3->status() === 200) {
    echo "Success! Todo deleted.\n";
} else {
    echo "Failed: " . $res3->status() . " (Error content suppressed)\n";
}

// 6. Verify Deletion
if (Todo::find($todo->id)) {
    echo "Error: Todo still exists in DB!\n";
} else {
    echo "Verified: Todo removed from DB.\n";
}
