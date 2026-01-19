import { useParams, Link } from 'react-router-dom';
import { usePublicMenu, PublicMenuItem, PublicMenuIngredient } from '@/hooks/usePublicMenu';
import { format, parseISO } from 'date-fns';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Copy,
  Info,
  Utensils,
  MapPin,
  Calendar,
  Shield,
  Leaf,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';

const POLYGONSCAN_BASE = 'https://polygonscan.com/tx/';

const PublicMenuPage = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const { data, isLoading, error } = usePublicMenu(menuId);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Hash copied to clipboard',
    });
  };

  const truncateHash = (hash: string, chars = 8) => {
    if (hash.length <= chars * 2) return hash;
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getVerificationBadge = (verified: boolean, hasBlockchain: boolean) => {
    if (verified && hasBlockchain) {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Blockchain Verified
        </Badge>
      );
    }
    if (verified) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
          <Clock className="h-3 w-3" />
          Pending Blockchain
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Not Verified
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-emerald-500 text-white text-xs">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500 text-white text-xs">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getAllergenBadge = (allergen: string) => (
    <Badge 
      key={allergen} 
      variant="outline" 
      className="border-orange-400 text-orange-700 bg-orange-50 text-xs font-medium"
    >
      <AlertTriangle className="h-3 w-3 mr-1" />
      {allergen}
    </Badge>
  );

  const getCategoryIcon = (category: string | null) => {
    const iconClass = "h-4 w-4";
    switch (category?.toLowerCase()) {
      case 'main':
      case 'secondo':
        return <Utensils className={iconClass} />;
      case 'side':
      case 'contorno':
        return <Leaf className={iconClass} />;
      default:
        return <Utensils className={iconClass} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Menu Not Found</h1>
            <p className="text-gray-600 mb-6">
              This menu doesn't exist or hasn't been published yet.
            </p>
            <Link to="/">
              <Button>Go to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { menu, verification } = data;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header Section */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Utensils className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg leading-tight">
                  {menu.school?.name || 'School Menu'}
                </h1>
                {menu.school?.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {menu.school.city}
                  </p>
                )}
              </div>
            </div>
            {getVerificationBadge(data.verified, !!verification.publicChain)}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Menu Info Card */}
        <Card className="border-emerald-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{menu.name}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(menu.date)}
                  </span>
                  {menu.mealType && (
                    <Badge variant="secondary" className="capitalize">
                      {menu.mealType}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Section */}
        <section>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Utensils className="h-5 w-5 text-emerald-600" />
            Today's Menu
          </h3>
          
          <div className="space-y-3">
            {menu.items?.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                isExpanded={expandedItems.has(item.id)}
                onToggle={() => toggleItem(item.id)}
                getStatusBadge={getStatusBadge}
                getAllergenBadge={getAllergenBadge}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
            
            {(!menu.items || menu.items.length === 0) && (
              <Card className="bg-gray-50">
                <CardContent className="py-8 text-center text-gray-500">
                  No menu items available
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Blockchain Verification Section */}
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Blockchain Verification
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    This menu's data has been cryptographically sealed and stored on a public blockchain.
                    This ensures the supply chain information cannot be altered and can be independently verified.
                  </p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Private Chain</span>
                {verification.privateChain ? (
                  <Badge className="bg-emerald-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Stored
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Public Chain (Polygon)</span>
                {verification.publicChain ? (
                  <Badge className="bg-emerald-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Anchored
                  </Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>

              {verification.menuHash && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Menu Hash</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(verification.menuHash!)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <code className="text-xs text-gray-700 font-mono break-all">
                    {truncateHash(verification.menuHash, 16)}
                  </code>
                </div>
              )}

              {verification.blockchainRecord?.txId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Transaction</span>
                    <a
                      href={`${POLYGONSCAN_BASE}${verification.blockchainRecord.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-sm"
                    >
                      View on PolygonScan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <code className="text-xs text-gray-700 font-mono">
                    {truncateHash(verification.blockchainRecord.txId, 12)}
                  </code>
                  {verification.blockchainRecord.blockNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Block #{verification.blockchainRecord.blockNumber}
                    </p>
                  )}
                </div>
              )}

              {verification.lastVerified && (
                <p className="text-xs text-gray-500 text-center">
                  Last verified: {format(parseISO(verification.lastVerified), 'PPpp')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Footer Section */}
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h4 className="font-semibold text-gray-900 mb-1">Share This Menu</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Scan the QR code to view this verified menu on any device
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <QrCode className="h-4 w-4" />
                  <span>Menu ID: {menu.menuId}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <QRCodeSVG 
                  value={currentUrl}
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Branding */}
        <footer className="text-center py-8">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by SmartFood Supply Chain</span>
          </div>
          <p className="text-xs text-gray-400">
            Ensuring food transparency and traceability through blockchain technology
          </p>
          <Link 
            to="/" 
            className="inline-block mt-4 text-sm text-emerald-600 hover:text-emerald-700 underline"
          >
            Learn more about our verification system
          </Link>
        </footer>
      </main>
    </div>
  );
};

// Separate component for menu items to keep code organized
interface MenuItemCardProps {
  item: PublicMenuItem;
  isExpanded: boolean;
  onToggle: () => void;
  getStatusBadge: (status: string) => JSX.Element;
  getAllergenBadge: (allergen: string) => JSX.Element;
  getCategoryIcon: (category: string | null) => JSX.Element;
}

const MenuItemCard = ({ 
  item, 
  isExpanded, 
  onToggle, 
  getStatusBadge, 
  getAllergenBadge,
  getCategoryIcon 
}: MenuItemCardProps) => {
  const hasIngredients = item.ingredients && item.ingredients.length > 0;
  
  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardContent className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  {getCategoryIcon(item.category)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {item.category && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {item.category}
                      </Badge>
                    )}
                    {item.allergens?.map(allergen => getAllergenBadge(allergen))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasIngredients && (
                  <span className="text-sm text-gray-500">
                    {item.ingredients.length} ingredients
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </CardContent>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="border-t bg-gray-50 px-4 py-4">
            {item.description && (
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>
            )}
            
            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Ingredient Traceability
            </h5>
            
            {hasIngredients ? (
              <div className="space-y-2">
                {item.ingredients.map((ingredient) => (
                  <IngredientRow 
                    key={ingredient.id} 
                    ingredient={ingredient} 
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No ingredient information available
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface IngredientRowProps {
  ingredient: PublicMenuIngredient;
  getStatusBadge: (status: string) => JSX.Element;
}

const IngredientRow = ({ ingredient, getStatusBadge }: IngredientRowProps) => {
  const doc = ingredient.document;
  
  return (
    <div className="bg-white rounded-lg p-3 border">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{ingredient.name}</span>
            {ingredient.quantity && ingredient.unit && (
              <span className="text-xs text-gray-500">
                ({ingredient.quantity} {ingredient.unit})
              </span>
            )}
          </div>
          
          {ingredient.origin && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              Origin: {ingredient.origin}
            </p>
          )}
          
          {doc && (
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>
                <span className="text-gray-500">Supplier:</span>{' '}
                {doc.vendor?.business_name || doc.vendor?.name || 'Unknown'}
              </p>
              <p>
                <span className="text-gray-500">DDT:</span>{' '}
                <code className="bg-gray-100 px-1 rounded">{doc.ddtNumber}</code>
              </p>
              {doc.deliveryDate && (
                <p>
                  <span className="text-gray-500">Delivered:</span>{' '}
                  {format(parseISO(doc.deliveryDate), 'PP')}
                </p>
              )}
              {doc.blockchainTxId && (
                <a
                  href={`https://polygonscan.com/tx/${doc.blockchainTxId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1"
                >
                  View blockchain proof
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
        
        <div>
          {doc ? getStatusBadge(doc.status) : (
            <Badge variant="secondary" className="text-xs">No DDT</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicMenuPage;
