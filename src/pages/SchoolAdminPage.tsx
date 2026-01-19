import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { QRCodeSVG } from "qrcode.react";
import {
  School,
  FileText,
  Calendar,
  UtensilsCrossed,
  Plus,
  Trash2,
  QrCode,
  CheckCircle2,
  Package,
  AlertCircle,
  Eye,
  Loader2,
  Link2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentSchool, useIngredients } from "@/hooks/useSchool";
import { useDocuments } from "@/hooks/useDocuments";
import { useMenus, useCreateMenu, usePublishMenu } from "@/hooks/useMenus";
import { VerificationStatus } from "@/types";

interface MenuItemForm {
  id: string;
  name: string;
  category: string;
  allergens: string[];
  ingredients: {
    id: string;
    ingredientId: string;
    name: string;
    quantity?: number;
    unit?: string;
  }[];
}

export default function SchoolAdminPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const { data: school, isLoading: schoolLoading } = useCurrentSchool();
  const { data: ingredients = [], isLoading: ingredientsLoading } = useIngredients(school?.id);
  const { data: documents = [], isLoading: docsLoading } = useDocuments(undefined, school?.id);
  const { data: menus = [], isLoading: menusLoading } = useMenus(school?.id);
  const createMenu = useCreateMenu();
  const publishMenu = usePublishMenu();

  // Route guard: Check if user has school_admin role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (!hasRole('school_admin')) {
        // Redirect to appropriate dashboard based on their role
        if (hasRole('admin')) {
          navigate('/admin');
        } else if (hasRole('vendor')) {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  const [activeTab, setActiveTab] = useState<'deliveries' | 'menus' | 'create'>('deliveries');
  const [menuItems, setMenuItems] = useState<MenuItemForm[]>([
    { 
      id: '1', 
      name: '', 
      category: 'main',
      allergens: [],
      ingredients: [] 
    }
  ]);
  const [menuDate, setMenuDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [menuName, setMenuName] = useState("");
  const [menuType, setMenuType] = useState("lunch");
  const [publishedQR, setPublishedQR] = useState<string | null>(null);

  // Filter verified documents and their ingredients
  const verifiedDocuments = documents.filter(d => d.status === 'verified');
  const verifiedIngredients = ingredients.filter(ing => 
    verifiedDocuments.some(doc => doc.id === ing.document_id)
  );

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { 
        id: Date.now().toString(), 
        name: '', 
        category: 'main',
        allergens: [],
        ingredients: [] 
      }
    ]);
  };

  const removeMenuItem = (id: string) => {
    if (menuItems.length > 1) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const updateMenuItem = (id: string, field: keyof MenuItemForm, value: any) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addIngredientToItem = (itemId: string, ingredientId: string) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    setMenuItems(menuItems.map(item => 
      item.id === itemId
        ? {
            ...item,
            ingredients: [...item.ingredients, {
              id: Date.now().toString(),
              ingredientId,
              name: ingredient.name,
              quantity: ingredient.quantity || undefined,
              unit: ingredient.unit || undefined
            }]
          }
        : item
    ));
  };

  const removeIngredientFromItem = (itemId: string, ingId: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId
        ? { ...item, ingredients: item.ingredients.filter(ing => ing.id !== ingId) }
        : item
    ));
  };

  const validateMenu = (): boolean => {
    if (!menuName.trim()) {
      toast.error("Please enter a menu name");
      return false;
    }
    if (!menuDate) {
      toast.error("Please select a menu date");
      return false;
    }
    for (const item of menuItems) {
      if (!item.name.trim()) {
        toast.error("All menu items must have a name");
        return false;
      }
      if (item.ingredients.length === 0) {
        toast.error(`"${item.name || 'Menu item'}" must have at least one ingredient linked`);
        return false;
      }
    }
    return true;
  };

  const handleCreateMenu = async () => {
    if (!school || !validateMenu()) return;

    try {
      await createMenu.mutateAsync({
        schoolId: school.id,
        date: menuDate,
        name: menuName,
        mealType: menuType,
        items: menuItems.map(item => ({
          name: item.name,
          category: item.category,
          allergens: item.allergens,
          ingredients: item.ingredients.map(ing => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit
          }))
        }))
      });

      // Reset form
      setMenuName("");
      setMenuItems([{ id: '1', name: '', category: 'main', allergens: [], ingredients: [] }]);
      setActiveTab("menus");
    } catch (error) {
      console.error("Failed to create menu:", error);
    }
  };

  const handlePublishMenu = async (menuId: string) => {
    try {
      await publishMenu.mutateAsync(menuId);
      setPublishedQR(menuId);
    } catch (error) {
      console.error("Failed to publish menu:", error);
    }
  };

  // Map database status to VerificationStatus type
  const mapStatus = (status: string | null): VerificationStatus => {
    switch (status) {
      case 'verified': return 'verified';
      case 'rejected': return 'rejected';
      case 'expired': return 'expired';
      case 'pending': return 'pending';
      default: return 'pending';
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Only render if user has school_admin role
  if (!user || !hasRole('school_admin')) {
    return null;
  }

  if (schoolLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!school) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-8 text-center max-w-md">
            <School className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No School Assigned</h2>
            <p className="text-muted-foreground">
              Contact an administrator to assign you to a school.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-muted/20">
        {/* Header */}
        <section className="bg-gradient-hero blockchain-pattern py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary-foreground/10 backdrop-blur">
                  <School className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground">
                    School Administration
                  </h1>
                  <p className="text-primary-foreground/70">
                    {school.name} • {school.city}, {school.province}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="container py-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={activeTab === 'deliveries' ? 'default' : 'outline'}
              onClick={() => setActiveTab('deliveries')}
              className={activeTab === 'deliveries' ? 'bg-gradient-hero' : ''}
            >
              <FileText className="mr-2 h-4 w-4" />
              Deliveries
            </Button>
            <Button
              variant={activeTab === 'menus' ? 'default' : 'outline'}
              onClick={() => setActiveTab('menus')}
              className={activeTab === 'menus' ? 'bg-gradient-hero' : ''}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Published Menus
            </Button>
            <Button
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => setActiveTab('create')}
              className={activeTab === 'create' ? 'bg-gradient-hero' : ''}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Menu
            </Button>
          </div>

          {/* Deliveries Tab */}
          {activeTab === 'deliveries' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Recent Deliveries</CardTitle>
                  <CardDescription>
                    View and verify incoming DDT documents from vendors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No deliveries received yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>DDT Number</TableHead>
                          <TableHead>Vendor</TableHead>
                          <TableHead>Delivery Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Blockchain</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium font-mono">
                              {doc.ddt_number}
                            </TableCell>
                            <TableCell>{doc.vendors?.name || 'Unknown'}</TableCell>
                            <TableCell>
                              {doc.delivery_date 
                                ? format(new Date(doc.delivery_date), 'MMM d, yyyy')
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={mapStatus(doc.status)} size="sm" />
                            </TableCell>
                            <TableCell>
                              {doc.blockchain_tx_id ? (
                                <Badge variant="outline" className="gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Anchored
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Published Menus Tab */}
          {activeTab === 'menus' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {menusLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : menus.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="text-center py-8 text-muted-foreground">
                    <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No menus created yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("create")}
                    >
                      Create your first menu
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menus.map((menu) => (
                    <Card key={menu.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{menu.name}</CardTitle>
                            <CardDescription>
                              {format(new Date(menu.date), 'EEEE, MMM d, yyyy')} • {menu.meal_type}
                            </CardDescription>
                          </div>
                          <Badge variant={menu.is_published ? "default" : "secondary"}>
                            {menu.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {menu.menu_items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <UtensilsCrossed className="h-4 w-4 text-primary" />
                              <span className="text-sm">{item.name}</span>
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {menu.is_published ? (
                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-center bg-white p-4 rounded-lg">
                              <QRCodeSVG 
                                value={`${window.location.origin}/verify?menu=${menu.id}`}
                                size={100}
                                level="M"
                              />
                            </div>
                            <p className="text-xs text-center text-muted-foreground mt-2">
                              Scan to verify
                            </p>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handlePublishMenu(menu.id)}
                            disabled={publishMenu.isPending}
                            className="w-full bg-gradient-hero"
                          >
                            {publishMenu.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <QrCode className="w-4 h-4 mr-2" />
                            )}
                            Publish & Generate QR
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Create Menu Tab */}
          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Menu Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Menu Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="menuName">Menu Name *</Label>
                          <Input
                            id="menuName"
                            placeholder="e.g., Monday Lunch"
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="menuDate">Menu Date *</Label>
                          <Input
                            id="menuDate"
                            type="date"
                            value={menuDate}
                            onChange={(e) => setMenuDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Meal Type *</Label>
                          <Select value={menuType} onValueChange={setMenuType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breakfast">Breakfast</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="snack">Snack</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Menu Items */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UtensilsCrossed className="h-5 w-5 text-primary" />
                            Menu Items
                          </CardTitle>
                          <CardDescription>
                            Add dishes and link each ingredient to verified DDTs
                          </CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addMenuItem}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add Dish
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {menuItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="flex-1 grid sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Dish Name</Label>
                                <Input
                                  placeholder="e.g., Pasta al Pomodoro"
                                  value={item.name}
                                  onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Category</Label>
                                <Select 
                                  value={item.category} 
                                  onValueChange={(v) => updateMenuItem(item.id, 'category', v)}
                                >
                                  <SelectTrigger className="mt-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="appetizer">Appetizer</SelectItem>
                                    <SelectItem value="main">Main Course</SelectItem>
                                    <SelectItem value="side">Side Dish</SelectItem>
                                    <SelectItem value="dessert">Dessert</SelectItem>
                                    <SelectItem value="beverage">Beverage</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {menuItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => removeMenuItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {/* Linked Ingredients */}
                          <div className="space-y-3 ml-4 border-l-2 border-primary/20 pl-4">
                            <Label className="text-sm">Linked Ingredients</Label>
                            
                            <div className="flex flex-wrap gap-2">
                              {item.ingredients.length === 0 ? (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  No ingredients linked. Select from verified DDTs below.
                                </p>
                              ) : (
                                item.ingredients.map((ing) => (
                                  <Badge 
                                    key={ing.id} 
                                    variant="secondary"
                                    className="gap-1 pr-1"
                                  >
                                    <Link2 className="w-3 h-3" />
                                    {ing.name}
                                    {ing.quantity && ` (${ing.quantity}${ing.unit || ''})`}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 ml-1 hover:bg-destructive/20"
                                      onClick={() => removeIngredientFromItem(item.id, ing.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </Badge>
                                ))
                              )}
                            </div>
                            
                            {/* Ingredient Selector */}
                            <Select onValueChange={(v) => addIngredientToItem(item.id, v)}>
                              <SelectTrigger className="w-full sm:w-[300px]">
                                <SelectValue placeholder="Add ingredient from verified DDT..." />
                              </SelectTrigger>
                              <SelectContent>
                                {verifiedIngredients.length === 0 ? (
                                  <div className="p-2 text-sm text-muted-foreground">
                                    No verified ingredients available
                                  </div>
                                ) : (
                                  verifiedIngredients.map((ing) => (
                                    <SelectItem 
                                      key={ing.id} 
                                      value={ing.id}
                                      disabled={item.ingredients.some(i => i.ingredientId === ing.id)}
                                    >
                                      {ing.name}
                                      {ing.lot_number && ` (Lot: ${ing.lot_number})`}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Create Button */}
                  <Button 
                    size="lg"
                    className="w-full h-12 bg-gradient-hero shadow-elevated"
                    onClick={handleCreateMenu}
                    disabled={createMenu.isPending}
                  >
                    {createMenu.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Menu...
                      </div>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Create Menu
                      </>
                    )}
                  </Button>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Available DDTs */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="h-5 w-5 text-primary" />
                        Available DDTs
                      </CardTitle>
                      <CardDescription>
                        Verified documents available for linking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {verifiedDocuments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No verified DDTs available. Ingredients from verified deliveries will appear here.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {verifiedDocuments.map((doc) => (
                            <div key={doc.id} className="bg-muted/30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm font-mono">
                                  {doc.ddt_number}
                                </span>
                                <StatusBadge status="verified" size="sm" showIcon={false} />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {doc.vendors?.name} • {doc.delivery_date 
                                  ? format(new Date(doc.delivery_date), 'MMM d')
                                  : '-'
                                }
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Traceability Info */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <QrCode className="h-5 w-5 text-primary" />
                        How It Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Create menu items</li>
                        <li>Link ingredients from verified DDTs</li>
                        <li>Publish to anchor to blockchain</li>
                        <li>Parents scan QR to verify food origin</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Published QR Modal */}
        {publishedQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setPublishedQR(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-card p-8 rounded-xl shadow-lg text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CheckCircle2 className="w-12 h-12 text-verified mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Menu Published!</h3>
              <p className="text-muted-foreground mb-6">
                Your menu has been anchored to the blockchain
              </p>
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <QRCodeSVG 
                  value={`${window.location.origin}/verify?menu=${publishedQR}`}
                  size={200}
                  level="M"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Parents can scan this QR code to verify menu traceability
              </p>
              <Button onClick={() => setPublishedQR(null)}>
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
