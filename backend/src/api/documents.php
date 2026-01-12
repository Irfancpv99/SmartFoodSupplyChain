<?php
/**
 * Document API endpoints (DDT/Invoice management)
 */

function handleCreateDocument() {
    $user = JWTUtil::requireAuth(['vendor', 'school', 'admin']);
    
    // Validate required fields
    $required = ['ddt_number', 'school_id', 'vendor_id', 'document_date', 'products'];
    foreach ($required as $field) {
        if (!isset($_POST[$field])) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request', 'message' => "Missing field: {$field}"]);
            return;
        }
    }

    // Validate file upload
    if (!isset($_FILES['document_photo']) || $_FILES['document_photo']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Bad Request', 'message' => 'Document photo is required']);
        return;
    }

    try {
        // Create uploads directory
        $uploadPath = getenv('UPLOAD_PATH') ?: '../uploads';
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        // Validate and save photo
        $photo = $_FILES['document_photo'];
        $allowedTypes = ['image/jpeg', 'image/png'];
        if (!in_array($photo['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request', 'message' => 'Invalid photo format. Use JPEG or PNG']);
            return;
        }

        $photoExt = pathinfo($photo['name'], PATHINFO_EXTENSION);
        $photoFileName = 'doc_' . uniqid() . '.' . $photoExt;
        $photoPath = $uploadPath . '/' . $photoFileName;
        
        if (!move_uploaded_file($photo['tmp_name'], $photoPath)) {
            throw new Exception('Failed to save document photo');
        }

        // Handle optional PDF upload
        $pdfPath = null;
        if (isset($_FILES['document_pdf']) && $_FILES['document_pdf']['error'] === UPLOAD_ERR_OK) {
            $pdf = $_FILES['document_pdf'];
            if ($pdf['type'] === 'application/pdf') {
                $pdfFileName = 'doc_' . uniqid() . '.pdf';
                $pdfPath = $uploadPath . '/' . $pdfFileName;
                move_uploaded_file($pdf['tmp_name'], $pdfPath);
            }
        }

        // Parse products JSON
        $products = json_decode($_POST['products'], true);
        if (!$products) {
            http_response_code(400);
            echo json_encode(['error' => 'Bad Request', 'message' => 'Invalid products JSON']);
            return;
        }

        // Insert document
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "INSERT INTO documents 
            (ddt_number, school_id, vendor_id, document_date, products, photo_path, pdf_path, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'verified')"
        );
        $stmt->execute([
            $_POST['ddt_number'],
            $_POST['school_id'],
            $_POST['vendor_id'],
            $_POST['document_date'],
            json_encode($products),
            $photoPath,
            $pdfPath
        ]);

        $documentId = $db->lastInsertId();

        // Generate hash and store in blockchain
        $timestamp = time();
        $documentData = [
            'ddt_number' => $_POST['ddt_number'],
            'school_id' => $_POST['school_id'],
            'vendor_id' => $_POST['vendor_id'],
            'document_date' => $_POST['document_date'],
            'products' => $products
        ];
        
        $hash = HashUtil::generateDocumentHash($documentData, $photoPath, $timestamp, $_POST['school_id']);
        
        $blockchainService = new BlockchainService();
        $blockchainService->storeDocumentHash($documentId, $hash);

        echo json_encode([
            'success' => true,
            'id' => $documentId,
            'hash' => $hash,
            'status' => 'verified',
            'created_at' => date('c')
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetDocuments() {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        
        // Build query based on user role
        $where = [];
        $params = [];
        
        if ($user->role === 'vendor' && $user->vendor_id) {
            $where[] = 'vendor_id = ?';
            $params[] = $user->vendor_id;
        } elseif ($user->role === 'school' && $user->school_id) {
            $where[] = 'school_id = ?';
            $params[] = $user->school_id;
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $stmt = $db->prepare(
            "SELECT d.*, v.company_name as vendor_name, s.name as school_name 
            FROM documents d 
            JOIN vendors v ON d.vendor_id = v.id 
            JOIN schools s ON d.school_id = s.id 
            {$whereClause}
            ORDER BY d.created_at DESC"
        );
        $stmt->execute($params);
        $documents = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'documents' => $documents
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}

function handleGetDocument($id) {
    $user = JWTUtil::requireAuth();
    
    try {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare(
            "SELECT d.*, v.company_name as vendor_name, s.name as school_name,
                    br.hash, br.public_chain_tx_hash, br.public_chain_anchored_at
            FROM documents d 
            JOIN vendors v ON d.vendor_id = v.id 
            JOIN schools s ON d.school_id = s.id 
            LEFT JOIN blockchain_records br ON d.id = br.document_id
            WHERE d.id = ?"
        );
        $stmt->execute([$id]);
        $document = $stmt->fetch();

        if (!$document) {
            http_response_code(404);
            echo json_encode(['error' => 'Not Found', 'message' => 'Document not found']);
            return;
        }

        echo json_encode([
            'success' => true,
            'document' => $document
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
    }
}
