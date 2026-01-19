import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QRScanner } from "@/components/QRScanner";
import { useToast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Search, 
  Shield, 
  FileText,
  Camera,
  Leaf,
  Info
} from "lucide-react";

const MENU_PATH_PREFIX = "/menu/";

// Sanitize menu ID to prevent XSS and ensure valid format
const sanitizeMenuId = (input: string): string | null => {
  const trimmed = input.trim();
  
  // Allow only alphanumeric characters, hyphens, and underscores
  const sanitized = trimmed.replace(/[^a-zA-Z0-9-_]/g, '');
  
  // Validate that the result is not empty and has reasonable length
  if (!sanitized || sanitized.length > 100) {
    return null;
  }
  
  return sanitized;
};

export default function ConsumerVerifyPage() {
  const [menuId, setMenuId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerify = () => {
    if (!menuId.trim()) {
      toast({
        title: "Menu ID Required",
        description: "Please enter a menu ID to continue.",
        variant: "destructive",
      });
      return;
    }
    
    const sanitizedMenuId = sanitizeMenuId(menuId);
    if (!sanitizedMenuId) {
      toast({
        title: "Invalid Menu ID",
        description: "Please enter a valid menu ID containing only letters, numbers, hyphens, and underscores.",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`${MENU_PATH_PREFIX}${sanitizedMenuId}`);
  };

  const handleScan = (result: string) => {
    setShowScanner(false);
    
    let menuIdToNavigate: string | null = null;
    
    // Try to parse as URL first (defensive programming)
    try {
      const url = new URL(result.trim());
      const pathParts = url.pathname.split('/');
      const menuIndex = pathParts.findIndex(p => p === 'menu');
      if (menuIndex !== -1 && pathParts[menuIndex + 1]) {
        menuIdToNavigate = sanitizeMenuId(pathParts[menuIndex + 1]);
      }
    } catch {
      // Not a valid URL, treat as direct input
      // Check if it's a path like /menu/{menuId}
      if (result.trim().startsWith(MENU_PATH_PREFIX)) {
        const menuIdFromPath = result.trim().substring(MENU_PATH_PREFIX.length);
        menuIdToNavigate = sanitizeMenuId(menuIdFromPath);
      } else {
        // Otherwise, it's just a menuId
        menuIdToNavigate = sanitizeMenuId(result);
      }
    }
    
    // Navigate only if we have a valid menu ID
    if (menuIdToNavigate) {
      navigate(`${MENU_PATH_PREFIX}${menuIdToNavigate}`);
    } else {
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code does not contain a valid menu ID. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-muted/20">
        {/* Hero */}
        <section className="bg-gradient-hero blockchain-pattern py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/10 backdrop-blur mb-6">
                <QrCode className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
                Scan the QR Code on Your Child's Menu
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Or enter the menu ID printed on the menu card to view ingredients, sources, and blockchain verification proof.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-12">
          <div className="container max-w-2xl">
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Find Your Child's Menu
                </CardTitle>
                <CardDescription>
                  Scan the QR code or enter the menu ID to view full details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="menuId" className="sr-only">Menu ID</Label>
                    <Input
                      id="menuId"
                      placeholder="Enter menu ID (e.g., MENU-20250114-ABC123)"
                      value={menuId}
                      onChange={(e) => setMenuId(e.target.value)}
                      className="h-12"
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setShowScanner(true)}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleVerify} 
                    className="h-12 px-6 bg-gradient-hero"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    View Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* QR Scanner Modal */}
        {showScanner && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowScanner(false)}
            />
            <QRScanner 
              onScan={handleScan}
              onClose={() => setShowScanner(false)}
            />
          </>
        )}

        {/* Info Section */}
        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-heading font-bold text-center mb-4">
              What You'll See
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              When you scan or search for a menu, you'll get complete transparency about what's served at school
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center shadow-card">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Every Ingredient</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete list of ingredients with origins and quantities for each menu item
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Verified Sources</h3>
                  <p className="text-sm text-muted-foreground">
                    Supplier information and delivery documents for full supply chain visibility
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">Blockchain Proof</h3>
                  <p className="text-sm text-muted-foreground">
                    Cryptographic verification that the supply chain data is authentic and tamper-proof
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 max-w-2xl mx-auto">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                      <Info className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">No Login Required</h4>
                      <p className="text-sm text-muted-foreground">
                        All menu information is publicly accessible. Simply scan the QR code on the menu card 
                        or enter the menu ID to see complete ingredient details and blockchain verification instantly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
