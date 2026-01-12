<?php
/**
 * Schools API endpoints
 */

function handleGetSchools() {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Filter based on user role
        $where = '';
        $params = [];
        
        if ($user->role === 'vendor' && $user->vendor_id) {
            // Get schools linked to this vendor
            $where = 'WHERE s.id IN (SELECT school_id FROM vendor_schools WHERE vendor_id = ?)';
            $params[] = $user->vendor_id;
        } elseif ($user->role === 'school' && $user->school_id) {
            $where = 'WHERE s.id = ?';
            $params[] = $user->school_id;
        }
        
        $stmt = $db->prepare(
            "SELECT * FROM schools s {$where} ORDER BY name"
        );
        $stmt->execute($params);
        $schools = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'schools' => $schools
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetSchool($id) {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM schools WHERE id = ?");
        $stmt->execute([$id]);
        $school = $stmt->fetch();

        if (!$school) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'message' => 'School not found']);
            return;
        }

        echo json_encode([
            'success' => true,
            'school' => $school
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}
