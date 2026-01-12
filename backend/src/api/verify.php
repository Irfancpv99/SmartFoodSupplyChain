<?php
/**
 * Verification API endpoints (Public - No authentication required)
 */

function handleVerifyMenu($id) {
    // Public endpoint - no authentication required
    try {
        $db = Database::getInstance()->getConnection();
        
        // Get menu with school info
        $stmt = $db->prepare(
            "SELECT m.*, s.name as school_name, s.address as school_address, s.region as school_region
            FROM menus m 
            JOIN schools s ON m.school_id = s.id 
            WHERE m.id = ? AND m.status = 'published'"
        );
        $stmt->execute([$id]);
        $menu = $stmt->fetch();

        if (!$menu) {
            http_response_code(404);
            echo json_encode([
                'error' => 'Not Found',
                'message' => 'Menu not found or not published'
            ]);
            return;
        }

        // Get all linked documents with vendor info
        $docsStmt = $db->prepare(
            "SELECT DISTINCT d.id, d.ddt_number, d.document_date, d.products, d.photo_path,
                    v.company_name as vendor_name, v.vat_number as vendor_vat, 
                    v.address as vendor_address, v.contact_email as vendor_email,
                    md.menu_item_name, md.ingredient_name,
                    br.hash as document_hash, br.public_chain_tx_hash, 
                    br.public_chain_anchored_at, br.verification_count
            FROM menu_documents md
            JOIN documents d ON md.document_id = d.id
            JOIN vendors v ON d.vendor_id = v.id
            LEFT JOIN blockchain_records br ON d.id = br.document_id
            WHERE md.menu_id = ?
            ORDER BY md.menu_item_name, md.ingredient_name"
        );
        $docsStmt->execute([$id]);
        $documents = $docsStmt->fetchAll();

        // Get blockchain verification status
        $blockchainService = new BlockchainService();
        $verificationStatus = $blockchainService->getMenuVerificationStatus($id);

        // Parse menu items
        $menuItems = json_decode($menu['items'], true);

        echo json_encode([
            'success' => true,
            'menu' => [
                'id' => $menu['id'],
                'menu_date' => $menu['menu_date'],
                'menu_type' => $menu['menu_type'],
                'items' => $menuItems,
                'published_at' => $menu['published_at'],
                'qr_code_url' => QRCodeUtil::getQRCodeUrl($menu['qr_code_path'])
            ],
            'school' => [
                'name' => $menu['school_name'],
                'address' => $menu['school_address'],
                'region' => $menu['school_region']
            ],
            'documents' => $documents,
            'verification' => $verificationStatus
        ]);

    } catch (Exception $e) {
        error_log("Verification error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal Server Error',
            'message' => 'Verification failed'
        ]);
    }
}

function handleVerifyHash($hash) {
    // Public endpoint - no authentication required
    try {
        $blockchainService = new BlockchainService();
        $record = $blockchainService->verifyHash($hash);

        if (!$record) {
            echo json_encode([
                'success' => true,
                'hash' => $hash,
                'exists' => false,
                'message' => 'Hash not found in blockchain'
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'hash' => $hash,
            'exists' => true,
            'type' => $record['hash_type'],
            'private_chain_timestamp' => $record['private_chain_stored_at'],
            'public_chain_tx' => $record['public_chain_tx_hash'],
            'public_chain_block' => $record['public_chain_block_number'],
            'public_chain_anchored_at' => $record['public_chain_anchored_at'],
            'verification_count' => $record['verification_count']
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Internal Server Error',
            'message' => 'Hash verification failed'
        ]);
    }
}
