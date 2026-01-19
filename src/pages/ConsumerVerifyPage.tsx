import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QRScanner } from "@/components/QRScanner";
import { 
  QrCode, 
  Search, 
  CheckCircle2, 
  Shield, 
  FileText,
  Truck,
  Calendar,
  Package,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Camera,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useVerifyMenu } from "@/hooks/useMenus";
import { format } from "date-fns";

interface VerificationResult {
  verified: boolean;
  menu: {
    id: string;
    menuId: string;
    name: string;
    date: string;
    mealType: string;
    school: { name: string; city?: string };
    items: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      allergens: string[] | null;
      ingredients: Array<{
        id: string;
        name: string;
        origin: string | null;
        quantity: number | null;
        unit: string | null;
        document: {
          id: string;
          ddtNumber: string;
          status: string;
          vendor: { name: string; business_name: string | null };
        } | null;
      }>;
    }>;
  };
  documents: Array<{
    id: string;
    ddtNumber: string;
    deliveryDate: string;
    status: string;
    hash: string | null;
    blockchainTxId: string | null;
    vendor: { name: string; business_name: string | null };
  }>;
  verification: {
    privateChain: boolean;
    publicChain: boolean;
    menuHash: string | null;
    lastVerified: string;
    blockchainRecord: {
      txId: string;
      blockNumber: number;
      timestamp: string;
    } | null;
  };
}

export default function ConsumerVerifyPage() {
  const [menuId, setMenuId] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const verifyMenuMutation = useVerifyMenu();

  const handleVerify = async (id?: string) => {
    const searchId = id || menuId;
    if (!searchId) {
      setVerificationError("Please enter a menu ID");
      return;
    }

    setVerificationError(null);
    
    try {
      const result = await verifyMenuMutation.mutateAsync(searchId);
      
      if (result.error) {
        setVerificationError(result.error);
        setVerificationResult(null);
      } else {
        setVerificationResult(result);
      }
    } catch (error) {
      setVerificationError("Failed to verify menu. Please try again.");
      setVerificationResult(null);
    }
  };

  const handleScan = (result: string) => {
    setShowScanner(false);
    setMenuId(result);
    handleVerify(result);
  };

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(i => i !== itemId) 
        : [...prev, itemId]
    );
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
                Verify Your Child's Meal
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Scan the QR code on the menu or enter the menu ID to view complete ingredient traceability. 
                No login required.
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
                  Menu Verification
                </CardTitle>
                <CardDescription>
                  Scan a QR code or enter the menu ID
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
                    onClick={() => handleVerify()} 
                    disabled={verifyMenuMutation.isPending}
                    className="h-12 px-6 bg-gradient-hero"
                  >
                    {verifyMenuMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
                
                {verificationError && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{verificationError}</span>
                  </div>
                )}
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

        {/* Verification Results */}
        {verificationResult && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-16"
          >
            <div className="container max-w-4xl">
              {/* Verification Status Card */}
              <Card className={`mb-6 shadow-card ${
                verificationResult.verified 
                  ? 'border-verified/30 bg-verified/5' 
                  : 'border-warning/30 bg-warning/5'
              }`}>
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-14 h-14 rounded-full ${
                        verificationResult.verified 
                          ? 'bg-verified/10 animate-verification' 
                          : 'bg-warning/10'
                      }`}>
                        <CheckCircle2 className={`h-8 w-8 ${
                          verificationResult.verified ? 'text-verified' : 'text-warning'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg">
                          {verificationResult.verified ? 'Menu Verified' : 'Verification Pending'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {verificationResult.verified 
                            ? 'Blockchain verification successful' 
                            : 'Menu not yet anchored to blockchain'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Private Chain</div>
                        <StatusBadge 
                          status={verificationResult.verification.privateChain ? 'verified' : 'pending'} 
                          size="sm" 
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Public Chain</div>
                        <StatusBadge 
                          status={verificationResult.verification.publicChain ? 'verified' : 'pending'} 
                          size="sm" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Info */}
              <Card className="mb-6 shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Menu Details
                      </CardTitle>
                      <CardDescription>
                        {verificationResult.menu.school?.name}
                        {verificationResult.menu.school?.city && ` - ${verificationResult.menu.school.city}`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-heading font-semibold">
                        {format(new Date(verificationResult.menu.date), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {verificationResult.menu.mealType} Menu
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Menu Items */}
              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-lg">Menu Items & Traceability</h3>
                
                {verificationResult.menu.items?.map((item) => (
                  <Card key={item.id} className="shadow-card overflow-hidden">
                    <button
                      onClick={() => toggleItemExpand(item.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.ingredients?.length || 0} ingredients traced
                          </p>
                        </div>
                      </div>
                      {expandedItems.includes(item.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    
                    {expandedItems.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t"
                      >
                        <div className="p-4 space-y-3 bg-muted/20">
                          {item.allergens && item.allergens.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              <span className="text-xs text-muted-foreground">Allergens:</span>
                              {item.allergens.map((allergen, i) => (
                                <span key={i} className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {item.ingredients?.map((ingredient) => (
                            <div key={ingredient.id} className="bg-card rounded-lg p-4 border">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h5 className="font-medium">{ingredient.name}</h5>
                                  {ingredient.origin && (
                                    <p className="text-xs text-muted-foreground">Origin: {ingredient.origin}</p>
                                  )}
                                </div>
                                <StatusBadge 
                                  status={ingredient.document ? 'verified' : 'pending'} 
                                  size="sm" 
                                />
                              </div>
                              
                              {ingredient.document && (
                                <div className="bg-muted/30 rounded-lg p-3 text-sm">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{ingredient.document.ddtNumber}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Truck className="h-3.5 w-3.5" />
                                    <span>
                                      {ingredient.document.vendor?.business_name || ingredient.document.vendor?.name}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Blockchain Record */}
              {verificationResult.verification.blockchainRecord && (
                <Card className="mt-6 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <LinkIcon className="h-5 w-5 text-blockchain" />
                      Blockchain Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {verificationResult.verification.menuHash && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <span className="text-sm text-muted-foreground">Menu Hash</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {verificationResult.verification.menuHash.substring(0, 16)}...
                          </code>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Block Number</span>
                        <span className="text-sm font-mono">
                          #{verificationResult.verification.blockchainRecord.blockNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Timestamp</span>
                        <span className="text-sm">
                          {format(new Date(verificationResult.verification.blockchainRecord.timestamp), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-muted-foreground">Transaction</span>
                        <code className="text-xs text-blockchain">
                          {verificationResult.verification.blockchainRecord.txId.substring(0, 20)}...
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.section>
        )}

        {/* Info Section */}
        {!verificationResult && !verificationError && (
          <section className="py-16 bg-muted/30">
            <div className="container max-w-4xl">
              <h2 className="text-2xl font-heading font-bold text-center mb-8">
                How Verification Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center shadow-card">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Find the QR code on the cafeteria menu display or printed handout
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-card">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Instant Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system checks the blockchain to verify document authenticity
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center shadow-card">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold mb-2">Full Traceability</h3>
                    <p className="text-sm text-muted-foreground">
                      View every ingredient source, vendor, and delivery document
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
