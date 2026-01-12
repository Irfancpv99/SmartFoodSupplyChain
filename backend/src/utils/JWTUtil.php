<?php
/**
 * JWT Utility for authentication
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTUtil {
    private static $secret;
    private static $expiration;

    public static function init() {
        self::$secret = getenv('JWT_SECRET') ?: 'default-secret-key';
        self::$expiration = (int)(getenv('JWT_EXPIRATION') ?: 1800);
    }

    public static function generateToken($userId, $username, $role, $schoolId = null, $vendorId = null): string {
        self::init();
        
        $issuedAt = time();
        $expire = $issuedAt + self::$expiration;

        $payload = [
            'iat' => $issuedAt,
            'exp' => $expire,
            'user_id' => $userId,
            'username' => $username,
            'role' => $role,
            'school_id' => $schoolId,
            'vendor_id' => $vendorId
        ];

        return JWT::encode($payload, self::$secret, 'HS256');
    }

    public static function validateToken($token): ?object {
        try {
            self::init();
            return JWT::decode($token, new Key(self::$secret, 'HS256'));
        } catch (Exception $e) {
            error_log("JWT validation failed: " . $e->getMessage());
            return null;
        }
    }

    public static function getTokenFromHeader(): ?string {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }

    public static function getCurrentUser(): ?object {
        $token = self::getTokenFromHeader();
        if (!$token) {
            return null;
        }
        
        return self::validateToken($token);
    }

    public static function requireAuth($allowedRoles = []): object {
        $user = self::getCurrentUser();
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Authentication required']);
            exit;
        }

        if (!empty($allowedRoles) && !in_array($user->role, $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden', 'message' => 'Insufficient permissions']);
            exit;
        }

        return $user;
    }
}
