<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Create User
$uniqueId = uniqid();
$email = "test_$uniqueId@example.com";
$password = "password123";

echo "Creating user: $email / $password\n";

try {
    $user = User::create([
        'name' => "Test User $uniqueId",
        'email' => $email,
        'password' => $password,
        'is_admin' => false,
    ]);
    
    echo "User created. ID: " . $user->id . "\n";
    echo "Stored Password Hash: " . substr($user->password, 0, 15) . "...\n";
    
    // 2. Verify Hash immediately
    if (Hash::check($password, $user->password)) {
        echo "SUCCESS: Hash::check passed immediately.\n";
    } else {
        echo "FAILURE: Hash::check failed immediately.\n";
    }

    // 3. Test Login Logic (Simulate Controller)
    $retrievedUser = User::where('email', $email)->first();
    if (!$retrievedUser || !Hash::check($password, $retrievedUser->password)) {
        echo "LOGIN LOGIC FAILURE: User not found or hash mismatch during retrieval.\n";
    } else {
        echo "LOGIN LOGIC SUCCESS: User found and password matches.\n";
        
        // 4. Test Token Creation
        try {
             $token = $retrievedUser->createToken('auth_token')->plainTextToken;
             echo "TOKEN CREATION SUCCESS: Token generated: " . substr($token, 0, 10) . "...\n";
        } catch (\Throwable $e) {
             echo "TOKEN CREATION FAILURE: " . $e->getMessage() . "\n";
        }
    }

} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}
