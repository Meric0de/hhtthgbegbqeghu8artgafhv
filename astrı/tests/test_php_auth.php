<?php
use PHPUnit\Framework\TestCase;

final class AuthTest extends TestCase
{
    private $baseUrl = 'http://localhost/php_auth';

    private function request($url, $method = 'GET', $data = null) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->baseUrl . '/' . $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        curl_setopt($ch, CURLOPT_COOKIEJAR, '/tmp/cookie.txt');
        curl_setopt($ch, CURLOPT_COOKIEFILE, '/tmp/cookie.txt');
        $response = curl_exec($ch);
        curl_close($ch);
        return json_decode($response, true);
    }

    public function testRegisterAndLoginAndLogout(): void
    {
        // Random username to avoid conflicts
        $username = 'testuser_' . rand(1000, 9999);
        $email = $username . '@example.com';
        $password = 'TestPass123!';

        // Register
        $register = $this->request('register.php', 'POST', [
            'username' => $username,
            'email' => $email,
            'password' => $password
        ]);
        $this->assertArrayHasKey('success', $register);
        $this->assertTrue($register['success']);

        // Login
        $login = $this->request('login.php', 'POST', [
            'username' => $username,
            'password' => $password
        ]);
        $this->assertArrayHasKey('success', $login);
        $this->assertTrue($login['success']);

        // Check session status
        $status = $this->request('session.php');
        $this->assertArrayHasKey('username', $status);
        $this->assertEquals($username, $status['username']);

        // Logout
        $logout = $this->request('logout.php', 'POST');
        $this->assertArrayHasKey('success', $logout);
        $this->assertTrue($logout['success']);
    }

    public function testLoginInvalidCredentials(): void
    {
        $login = $this->request('login.php', 'POST', [
            'username' => 'nonexistentuser',
            'password' => 'wrongpass'
        ]);
        $this->assertArrayHasKey('error', $login);
    }
}
