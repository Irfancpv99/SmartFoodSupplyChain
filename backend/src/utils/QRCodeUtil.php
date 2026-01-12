<?php
/**
 * QR Code Utility
 */

class QRCodeUtil {
    /**
     * Generate QR code for menu verification
     */
    public static function generateMenuQR($menuId, $menuHash): string {
        $baseUrl = getenv('VERIFICATION_BASE_URL') ?: 'http://localhost:3000/verify';
        $hashPrefix = HashUtil::getHashPrefix($menuHash);
        $verificationUrl = "{$baseUrl}/menu/{$menuId}?h={$hashPrefix}";
        
        // Create QR code directory if it doesn't exist
        $qrPath = getenv('QR_CODE_PATH') ?: '../qr-codes';
        if (!file_exists($qrPath)) {
            mkdir($qrPath, 0755, true);
        }
        
        $qrFileName = "menu_{$menuId}_{$hashPrefix}.png";
        $qrFilePath = "{$qrPath}/{$qrFileName}";
        
        // Generate QR code using simple implementation
        self::generateSimpleQR($verificationUrl, $qrFilePath);
        
        return $qrFilePath;
    }

    /**
     * Simple QR code generation (fallback if library not available)
     */
    private static function generateSimpleQR($data, $filePath): void {
        // Use Google Charts API as fallback for QR generation
        $size = '300x300';
        $url = "https://chart.googleapis.com/chart?chs={$size}&cht=qr&chl=" . urlencode($data);
        
        $qrImage = @file_get_contents($url);
        if ($qrImage !== false) {
            file_put_contents($filePath, $qrImage);
        } else {
            // Create placeholder image if API fails
            $image = imagecreate(300, 300);
            $bgColor = imagecolorallocate($image, 255, 255, 255);
            $textColor = imagecolorallocate($image, 0, 0, 0);
            imagestring($image, 5, 50, 140, 'QR Code', $textColor);
            imagepng($image, $filePath);
            imagedestroy($image);
        }
    }

    /**
     * Get QR code URL for display
     */
    public static function getQRCodeUrl($qrPath): string {
        $appUrl = getenv('APP_URL') ?: 'http://localhost:8000';
        $relativePath = str_replace('../', '', $qrPath);
        return "{$appUrl}/{$relativePath}";
    }
}
