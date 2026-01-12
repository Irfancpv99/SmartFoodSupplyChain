<?php
/**
 * Smart Food Supply Chain API - Main Entry Point
 */

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
    }
}

// Enable CORS
$allowedOrigins = explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:3000');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: {$origin}");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set response type
header("Content-Type: application/json; charset=UTF-8");

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Autoload classes
spl_autoload_register(function ($class) {
    $file = __DIR__ . '/../src/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// Load configuration
require_once __DIR__ . '/../config/database.php';

// Load utilities
require_once __DIR__ . '/../src/utils/JWTUtil.php';
require_once __DIR__ . '/../src/utils/HashUtil.php';
require_once __DIR__ . '/../src/utils/QRCodeUtil.php';

// Load services
require_once __DIR__ . '/../src/services/BlockchainService.php';

// Load API controllers
require_once __DIR__ . '/../src/api/auth.php';
require_once __DIR__ . '/../src/api/documents.php';
require_once __DIR__ . '/../src/api/menus.php';
require_once __DIR__ . '/../src/api/verify.php';
require_once __DIR__ . '/../src/api/schools.php';
require_once __DIR__ . '/../src/api/vendors.php';

// Router
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$uri = parse_url($requestUri, PHP_URL_PATH);

// Remove /api/v1 prefix if present
$uri = preg_replace('#^/api/v1#', '', $uri);

// Route mapping
$routes = [
    // Auth routes
    'POST /auth/login' => 'handleLogin',
    'POST /auth/register' => 'handleRegister',
    'GET /auth/me' => 'handleGetCurrentUser',
    
    // Document routes
    'POST /documents' => 'handleCreateDocument',
    'GET /documents' => 'handleGetDocuments',
    'GET /documents/(\d+)' => 'handleGetDocument',
    
    // Menu routes
    'POST /menus' => 'handleCreateMenu',
    'GET /menus' => 'handleGetMenus',
    'GET /menus/(\d+)' => 'handleGetMenu',
    'POST /menus/(\d+)/publish' => 'handlePublishMenu',
    
    // Verification routes (public)
    'GET /verify/menu/(\d+)' => 'handleVerifyMenu',
    'GET /verify/hash/([a-f0-9]+)' => 'handleVerifyHash',
    
    // School routes
    'GET /schools' => 'handleGetSchools',
    'GET /schools/(\d+)' => 'handleGetSchool',
    
    // Vendor routes
    'GET /vendors' => 'handleGetVendors',
    'GET /vendors/(\d+)' => 'handleGetVendor',
    
    // Health check
    'GET /health' => function() {
        echo json_encode(['status' => 'healthy', 'timestamp' => date('c')]);
    }
];

// Match route
$matched = false;
foreach ($routes as $route => $handler) {
    list($method, $pattern) = explode(' ', $route);
    
    if ($method !== $requestMethod) {
        continue;
    }
    
    $pattern = '#^' . $pattern . '$#';
    if (preg_match($pattern, $uri, $matches)) {
        $matched = true;
        array_shift($matches); // Remove full match
        
        if (is_callable($handler)) {
            call_user_func_array($handler, $matches);
        } else {
            call_user_func_array($handler, $matches);
        }
        break;
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode([
        'error' => 'Not Found',
        'message' => 'The requested endpoint does not exist',
        'path' => $uri
    ]);
}
