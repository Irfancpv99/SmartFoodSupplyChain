import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, SwitchCamera } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  useEffect(() => {
    const initScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          startScanning(devices[0].id);
        } else {
          setError("No camera found on this device");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Camera access denied. Please allow camera permissions.");
      }
    };

    initScanner();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async (cameraId: string) => {
    try {
      if (scannerRef.current) {
        await stopScanning();
      }

      scannerRef.current = new Html5Qrcode("qr-reader");
      
      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Extract menu ID from the QR code URL
          let menuId = decodedText;
          
          // Try to parse as URL
          try {
            const url = new URL(decodedText);
            const pathParts = url.pathname.split('/');
            const menuIndex = pathParts.findIndex(p => p === 'menu');
            if (menuIndex !== -1 && pathParts[menuIndex + 1]) {
              menuId = pathParts[menuIndex + 1];
            }
          } catch {
            // Not a URL, use as-is
          }
          
          onScan(menuId);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore continuous scanning errors
        }
      );
      
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Scanner start error:", err);
      setError("Failed to start camera. Please try again.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Stop scanning error:", err);
      }
    }
    setIsScanning(false);
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) return;
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    await startScanning(cameras[nextIndex].id);
  };

  return (
    <Card className="fixed inset-4 md:inset-auto md:fixed md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[400px] z-50 shadow-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Scan QR Code</h3>
          </div>
          <div className="flex items-center gap-2">
            {cameras.length > 1 && (
              <Button variant="ghost" size="icon" onClick={switchCamera}>
                <SwitchCamera className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div 
          id="qr-reader" 
          className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
        />

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center mt-4">
          Point your camera at the QR code on the menu
        </p>
      </CardContent>
    </Card>
  );
}
