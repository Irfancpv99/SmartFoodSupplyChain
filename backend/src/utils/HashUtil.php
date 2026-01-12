<?php
/**
 * Hash Utility for blockchain hashing
 */

class HashUtil {
    /**
     * Generate SHA-256 hash for document
     * Combines: document content + photo binary + timestamp + school_id
     */
    public static function generateDocumentHash($documentData, $photoPath, $timestamp, $schoolId): string {
        $documentJson = json_encode($documentData);
        $photoBinary = file_exists($photoPath) ? file_get_contents($photoPath) : '';
        
        $combinedData = $documentJson . $photoBinary . $timestamp . $schoolId;
        return hash('sha256', $combinedData);
    }

    /**
     * Generate SHA-256 hash for menu
     * Combines: menu content + all linked DDT hashes
     */
    public static function generateMenuHash($menuContent, $ddtHashes): string {
        $menuJson = json_encode($menuContent);
        sort($ddtHashes); // Ensure consistent ordering
        $ddtHashString = implode('', $ddtHashes);
        
        $combinedData = $menuJson . $ddtHashString;
        return hash('sha256', $combinedData);
    }

    /**
     * Generate short hash prefix for QR codes (first 8 characters)
     */
    public static function getHashPrefix($hash, $length = 8): string {
        return substr($hash, 0, $length);
    }

    /**
     * Verify hash matches expected value
     */
    public static function verifyHash($hash, $expectedHash): bool {
        return hash_equals($hash, $expectedHash);
    }
}
