<?php
/**
 * Authentication API endpoints
 */

function handleLogin() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request', 'message' => 'Username and password required']);
        return;
    }

    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "SELECT id, username, email, password_hash, role, vendor_id, school_id 
            FROM users 
            WHERE username = ? AND is_active = TRUE"
        );
        $stmt->execute([$input['username']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($input['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Invalid credentials']);
            return;
        }

        $token = JWTUtil::generateToken(
            $user['id'],
            $user['username'],
            $user['role'],
            $user['school_id'],
            $user['vendor_id']
        );

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'school_id' => $user['school_id'],
                'vendor_id' => $user['vendor_id']
            ]
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleRegister() {
    $user = JWTUtil::requireAuth(['super_admin', 'admin']);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['username', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request', 'message' => "Missing field: {$field}"]);
            return;
        }
    }

    try {
        $db = Database::getInstance()->getConnection();
        
        // Check if username or email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$input['username'], $input['email']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Conflict', 'message' => 'Username or email already exists']);
            return;
        }

        $passwordHash = password_hash($input['password'], PASSWORD_BCRYPT);
        
        $stmt = $db->prepare(
            "INSERT INTO users (username, email, password_hash, role, vendor_id, school_id) 
            VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $input['username'],
            $input['email'],
            $passwordHash,
            $input['role'],
            $input['vendor_id'] ?? null,
            $input['school_id'] ?? null
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'User created successfully',
            'user_id' => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetCurrentUser() {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "SELECT id, username, email, role, vendor_id, school_id, created_at 
            FROM users WHERE id = ?"
        );
        $stmt->execute([$user->user_id]);
        $userData = $stmt->fetch();

        if (!$userData) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'message' => 'User not found']);
            return;
        }

        echo json_encode([
            'success' => true,
            'user' => $userData
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}
