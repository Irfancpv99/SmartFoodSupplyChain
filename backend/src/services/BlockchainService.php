<?php
/**
 * Blockchain Service for hash storage and verification
 */

class BlockchainService {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Store document hash in private chain (MySQL)
     */
    public function storeDocumentHash($documentId, $hash): bool {
        try {
            $stmt = $this->db->prepare(
                "INSERT INTO blockchain_records 
                (document_id, hash, hash_type, private_chain_stored_at) 
                VALUES (?, ?, 'document', NOW())"
            );
            return $stmt->execute([$documentId, $hash]);
        } catch (PDOException $e) {
            error_log("Failed to store document hash: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Store menu hash in private chain (MySQL)
     */
    public function storeMenuHash($menuId, $hash): bool {
        try {
            $stmt = $this->db->prepare(
                "INSERT INTO blockchain_records 
                (menu_id, hash, hash_type, private_chain_stored_at) 
                VALUES (?, ?, 'menu', NOW())"
            );
            return $stmt->execute([$menuId, $hash]);
        } catch (PDOException $e) {
            error_log("Failed to store menu hash: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify hash exists in private chain
     */
    public function verifyHash($hash): ?array {
        try {
            $stmt = $this->db->prepare(
                "SELECT * FROM blockchain_records WHERE hash = ?"
            );
            $stmt->execute([$hash]);
            $record = $stmt->fetch();
            
            if ($record) {
                // Increment verification count
                $updateStmt = $this->db->prepare(
                    "UPDATE blockchain_records 
                    SET verification_count = verification_count + 1 
                    WHERE id = ?"
                );
                $updateStmt->execute([$record['id']]);
            }
            
            return $record ?: null;
        } catch (PDOException $e) {
            error_log("Hash verification failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get pending hashes for public chain anchoring
     */
    public function getPendingHashes(): array {
        try {
            $stmt = $this->db->prepare(
                "SELECT id, hash FROM blockchain_records 
                WHERE public_chain_anchored_at IS NULL 
                ORDER BY created_at ASC"
            );
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Failed to get pending hashes: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Update record with public chain anchoring info
     */
    public function updatePublicChainAnchor($id, $txHash, $blockNumber): bool {
        try {
            $stmt = $this->db->prepare(
                "UPDATE blockchain_records 
                SET public_chain_tx_hash = ?, 
                    public_chain_block_number = ?, 
                    public_chain_anchored_at = NOW() 
                WHERE id = ?"
            );
            return $stmt->execute([$txHash, $blockNumber, $id]);
        } catch (PDOException $e) {
            error_log("Failed to update public chain anchor: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Simulate public blockchain anchoring (daily batch)
     * In production, this would connect to Ethereum/Hyperledger
     */
    public function anchorToPublicChain(): array {
        $pendingHashes = $this->getPendingHashes();
        
        if (empty($pendingHashes)) {
            return ['success' => true, 'message' => 'No pending hashes', 'count' => 0];
        }

        // Simulate anchoring (in production, use actual blockchain)
        $merkleRoot = $this->calculateMerkleRoot(array_column($pendingHashes, 'hash'));
        $simulatedTxHash = '0x' . hash('sha256', $merkleRoot . time());
        $simulatedBlockNumber = time(); // In production, get actual block number

        $anchoredCount = 0;
        foreach ($pendingHashes as $record) {
            if ($this->updatePublicChainAnchor($record['id'], $simulatedTxHash, $simulatedBlockNumber)) {
                $anchoredCount++;
            }
        }

        return [
            'success' => true,
            'message' => "Anchored {$anchoredCount} hashes to public chain",
            'count' => $anchoredCount,
            'tx_hash' => $simulatedTxHash,
            'block_number' => $simulatedBlockNumber
        ];
    }

    /**
     * Calculate Merkle root for batch anchoring
     */
    private function calculateMerkleRoot(array $hashes): string {
        if (empty($hashes)) {
            return '';
        }
        
        if (count($hashes) === 1) {
            return $hashes[0];
        }

        $newLevel = [];
        for ($i = 0; $i < count($hashes); $i += 2) {
            $left = $hashes[$i];
            $right = isset($hashes[$i + 1]) ? $hashes[$i + 1] : $left;
            $newLevel[] = hash('sha256', $left . $right);
        }

        return $this->calculateMerkleRoot($newLevel);
    }

    /**
     * Get blockchain verification status for menu
     */
    public function getMenuVerificationStatus($menuId): array {
        try {
            $stmt = $this->db->prepare(
                "SELECT hash, hash_type, private_chain_stored_at, 
                        public_chain_tx_hash, public_chain_anchored_at, 
                        verification_count 
                FROM blockchain_records 
                WHERE menu_id = ?"
            );
            $stmt->execute([$menuId]);
            $record = $stmt->fetch();

            if (!$record) {
                return [
                    'verified' => false,
                    'message' => 'No blockchain record found'
                ];
            }

            return [
                'verified' => true,
                'private_chain' => !empty($record['private_chain_stored_at']),
                'public_chain' => !empty($record['public_chain_anchored_at']),
                'hash' => $record['hash'],
                'tx_hash' => $record['public_chain_tx_hash'],
                'last_verified' => $record['private_chain_stored_at'],
                'verification_count' => $record['verification_count']
            ];
        } catch (PDOException $e) {
            error_log("Failed to get verification status: " . $e->getMessage());
            return [
                'verified' => false,
                'message' => 'Verification check failed'
            ];
        }
    }
}
