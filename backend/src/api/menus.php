<?php
/**
 * Menu API endpoints
 */

function handleCreateMenu() {
    $user = JWTUtil::requireAuth(['school', 'admin']);
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['school_id', 'menu_date', 'menu_type', 'items'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request', 'message' => "Missing field: {$field}"]);
            return;
        }
    }

    try {
        $db = Database::getInstance()->getConnection();
        
        // Insert menu
        $stmt = $db->prepare(
            "INSERT INTO menus (school_id, menu_date, menu_type, items, status) 
            VALUES (?, ?, ?, ?, 'draft')"
        );
        $stmt->execute([
            $input['school_id'],
            $input['menu_date'],
            $input['menu_type'],
            json_encode($input['items'])
        ]);

        $menuId = $db->lastInsertId();

        // Link documents to menu items
        if (isset($input['items']) && is_array($input['items'])) {
            foreach ($input['items'] as $item) {
                if (isset($item['ingredients']) && is_array($item['ingredients'])) {
                    foreach ($item['ingredients'] as $ingredient) {
                        if (isset($ingredient['document_ids']) && is_array($ingredient['document_ids'])) {
                            foreach ($ingredient['document_ids'] as $docId) {
                                $linkStmt = $db->prepare(
                                    "INSERT INTO menu_documents (menu_id, document_id, menu_item_name, ingredient_name) 
                                    VALUES (?, ?, ?, ?)"
                                );
                                $linkStmt->execute([
                                    $menuId,
                                    $docId,
                                    $item['name'],
                                    $ingredient['name']
                                ]);
                            }
                        }
                    }
                }
            }
        }

        echo json_encode([
            'success' => true,
            'menu_id' => $menuId,
            'status' => 'draft',
            'message' => 'Menu created successfully'
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetMenus() {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Build query based on user role
        $where = [];
        $params = [];
        
        if ($user->role === 'school' && $user->school_id) {
            $where[] = 'school_id = ?';
            $params[] = $user->school_id;
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $stmt = $db->prepare(
            "SELECT m.*, s.name as school_name 
            FROM menus m 
            JOIN schools s ON m.school_id = s.id 
            {$whereClause}
            ORDER BY m.menu_date DESC, m.created_at DESC"
        );
        $stmt->execute($params);
        $menus = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'menus' => $menus
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetMenu($id) {
    // Public access for consumer verification
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "SELECT m.*, s.name as school_name, s.address as school_address
            FROM menus m 
            JOIN schools s ON m.school_id = s.id 
            WHERE m.id = ?"
        );
        $stmt->execute([$id]);
        $menu = $stmt->fetch();

        if (!$menu) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'message' => 'Menu not found']);
            return;
        }

        // Get linked documents
        $docsStmt = $db->prepare(
            "SELECT DISTINCT d.*, v.company_name as vendor_name, md.menu_item_name, md.ingredient_name
            FROM menu_documents md
            JOIN documents d ON md.document_id = d.id
            JOIN vendors v ON d.vendor_id = v.id
            WHERE md.menu_id = ?"
        );
        $docsStmt->execute([$id]);
        $documents = $docsStmt->fetchAll();

        $menu['documents'] = $documents;

        echo json_encode([
            'success' => true,
            'menu' => $menu
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handlePublishMenu($id) {
    $user = JWTUtil::requireAuth(['school', 'admin']);
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get menu
        $stmt = $db->prepare("SELECT * FROM menus WHERE id = ?");
        $stmt->execute([$id]);
        $menu = $stmt->fetch();

        if (!$menu) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'message' => 'Menu not found']);
            return;
        }

        // Validate DDT coverage
        $items = json_decode($menu['items'], true);
        $missing = [];

        foreach ($items as $item) {
            if (isset($item['ingredients'])) {
                foreach ($item['ingredients'] as $ingredient) {
                    if (!isset($ingredient['document_ids']) || empty($ingredient['document_ids'])) {
                        $missing[] = [
                            'item' => $item['name'],
                            'ingredient' => $ingredient['name'],
                            'message' => 'No DDT linked'
                        ];
                    }
                }
            }
        }

        if (!empty($missing)) {
            http_response_code(400);
            echo json_encode([
                'error' => 'incomplete_ddt_coverage',
                'message' => 'Menu has incomplete DDT coverage',
                'missing' => $missing
            ]);
            return;
        }

        // Get all linked document hashes
        $hashStmt = $db->prepare(
            "SELECT br.hash 
            FROM menu_documents md 
            JOIN blockchain_records br ON md.document_id = br.document_id 
            WHERE md.menu_id = ?"
        );
        $hashStmt->execute([$id]);
        $ddtHashes = array_column($hashStmt->fetchAll(), 'hash');

        // Generate menu hash
        $menuHash = HashUtil::generateMenuHash($menu['items'], $ddtHashes);

        // Generate QR code
        $qrCodePath = QRCodeUtil::generateMenuQR($id, $menuHash);

        // Store menu hash in blockchain
        $blockchainService = new BlockchainService();
        $blockchainService->storeMenuHash($id, $menuHash);

        // Update menu status
        $updateStmt = $db->prepare(
            "UPDATE menus 
            SET status = 'published', qr_code_path = ?, published_at = NOW() 
            WHERE id = ?"
        );
        $updateStmt->execute([$qrCodePath, $id]);

        $verificationUrl = (getenv('VERIFICATION_BASE_URL') ?: 'http://localhost:3000/verify') . "/menu/{$id}";

        echo json_encode([
            'success' => true,
            'menu_id' => $id,
            'menu_hash' => $menuHash,
            'qr_code_url' => QRCodeUtil::getQRCodeUrl($qrCodePath),
            'verification_url' => $verificationUrl,
            'published_at' => date('c')
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}
