<?php
/**
 * Vendors API endpoints
 */

function handleGetVendors() {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Filter based on user role
        $where = '';
        $params = [];
        
        if ($user->role === 'school' && $user->school_id) {
            // Get vendors linked to this school
            $where = 'WHERE v.id IN (SELECT vendor_id FROM vendor_schools WHERE school_id = ?)';
            $params[] = $user->school_id;
        } elseif ($user->role === 'vendor' && $user->vendor_id) {
            $where = 'WHERE v.id = ?';
            $params[] = $user->vendor_id;
        }
        
        $stmt = $db->prepare(
            "SELECT * FROM vendors v {$where} ORDER BY company_name"
        );
        $stmt->execute($params);
        $vendors = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'vendors' => $vendors
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetVendor($id) {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM vendors WHERE id = ?");
        $stmt->execute([$id]);
        $vendor = $stmt->fetch();

        if (!$vendor) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'message' => 'Vendor not found']);
            return;
        }

        echo json_encode([
            'success' => true,
            'vendor' => $vendor
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}
