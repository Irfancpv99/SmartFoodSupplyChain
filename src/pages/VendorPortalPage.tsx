import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Truck,
  Upload,
  FileText,
  Plus,
  Trash2,
  History,
  CheckCircle2,
  Building2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, useSchools } from "@/hooks/useVendor";
import { useDocuments, useUploadDocument, useAnchorToBlockchain } from "@/hooks/useDocuments";

interface ProductEntry {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  lotNumber: string;
  origin: string;
}

export default function VendorPortalPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const { data: vendor, isLoading: vendorLoading } = useCurrentVendor();
  const { data: schools = [] } = useSchools();
  const { data: documents = [], isLoading: docsLoading } = useDocuments(vendor?.id);
  const uploadDocument = useUploadDocument();
  const anchorToBlockchain = useAnchorToBlockchain();

  // Route guard: Check if user has vendor role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('VendorPortal: No user, redirecting to login');
        navigate('/login');
      } else if (!hasRole('vendor')) {
        console.log('VendorPortal: User lacks vendor role, redirecting based on available roles');
        // Redirect to appropriate dashboard based on their role
        if (hasRole('admin')) {
          navigate('/admin');
        } else if (hasRole('school_admin')) {
          navigate('/school');
        } else {
          // User has no recognized roles, redirect to home
          console.warn('VendorPortal: User has no recognized roles, redirecting to home');
          navigate('/');
        }
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const [selectedSchool, setSelectedSchool] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ProductEntry[]>([
    { id: '1', name: '', quantity: '', unit: 'kg', lotNumber: '', origin: '' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addProduct = () => {
    setProducts([
      ...products,
      { id: Date.now().toString(), name: '', quantity: '', unit: 'kg', lotNumber: '', origin: '' }
    ]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof ProductEntry, value: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/xml', 'text/xml'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload a PDF or XML file',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!selectedSchool) {
      toast.error('Please select a school');
      return;
    }

    try {
      await uploadDocument.mutateAsync({
        file: selectedFile,
        schoolId: selectedSchool,
        deliveryDate,
        products: products.filter(p => p.name),
      });
      
      // Reset form
      setSelectedSchool("");
      setDeliveryDate("");
      setSelectedFile(null);
      setProducts([{ id: '1', name: '', quantity: '', unit: 'kg', lotNumber: '', origin: '' }]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAnchorDocument = async (doc: any) => {
    try {
      await anchorToBlockchain.mutateAsync({
        referenceId: doc.id,
        referenceTable: 'documents',
        data: {
          ddtNumber: doc.ddt_number,
          vendorId: doc.vendor_id,
          schoolId: doc.school_id,
          fileHash: doc.file_hash,
          uploadDate: doc.upload_date,
        },
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Only render if user has vendor role
  if (!user || !hasRole('vendor')) {
    return null;
  }

  if (vendorLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!vendor) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Vendor Profile</h2>
              <p className="text-muted-foreground">
                Your account is not linked to a vendor profile. Please contact an administrator.
              </p>
            </CardContent>
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
                  <Truck className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground">
                    Vendor Portal
                  </h1>
                  <p className="text-primary-foreground/70">
                    {vendor.business_name || vendor.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge 
                  status={vendor.is_verified ? 'verified' : 'pending'} 
                  size="lg" 
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="container py-6">
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'upload' ? 'default' : 'outline'}
              onClick={() => setActiveTab('upload')}
              className={activeTab === 'upload' ? 'bg-gradient-hero' : ''}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'bg-gradient-hero' : ''}
            >
              <History className="mr-2 h-4 w-4" />
              Document History
            </Button>
          </div>

          {activeTab === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Main Form */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          Document Information
                        </CardTitle>
                        <CardDescription>
                          DDT number will be automatically generated
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>DDT Number</Label>
                            <Input
                              placeholder="Auto-generated on upload"
                              disabled
                              className="bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryDate">Delivery Date *</Label>
                            <Input
                              id="deliveryDate"
                              type="date"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="school">Delivery School *</Label>
                          <Select value={selectedSchool} onValueChange={setSelectedSchool} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a school" />
                            </SelectTrigger>
                            <SelectContent>
                              {schools.map((school: any) => (
                                <SelectItem key={school.id} value={school.id}>
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    {school.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Products */}
                    <Card className="shadow-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Products</CardTitle>
                            <CardDescription>
                              List all products in this delivery
                            </CardDescription>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                            <Plus className="mr-1 h-4 w-4" />
                            Add Product
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {products.map((product) => (
                            <div key={product.id} className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg">
                              <div className="flex-1 grid sm:grid-cols-5 gap-3">
                                <div className="sm:col-span-2">
                                  <Label className="text-xs text-muted-foreground">Product Name</Label>
                                  <Input
                                    placeholder="e.g., Pomodori San Marzano"
                                    value={product.name}
                                    onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Quantity</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      type="number"
                                      placeholder="50"
                                      value={product.quantity}
                                      onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                                      className="flex-1"
                                    />
                                    <Select 
                                      value={product.unit} 
                                      onValueChange={(v) => updateProduct(product.id, 'unit', v)}
                                    >
                                      <SelectTrigger className="w-20">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="g">g</SelectItem>
                                        <SelectItem value="L">L</SelectItem>
                                        <SelectItem value="pcs">pcs</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Lot Number</Label>
                                  <Input
                                    placeholder="LOT-001"
                                    value={product.lotNumber}
                                    onChange={(e) => updateProduct(product.id, 'lotNumber', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs text-muted-foreground">Origin</Label>
                                  <Input
                                    placeholder="Italy"
                                    value={product.origin}
                                    onChange={(e) => updateProduct(product.id, 'origin', e.target.value)}
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-5 text-muted-foreground hover:text-destructive"
                                onClick={() => removeProduct(product.id)}
                                disabled={products.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* File Upload */}
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          DDT Document *
                        </CardTitle>
                        <CardDescription>
                          Upload PDF or XML file (max 10MB)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.xml,application/pdf,application/xml,text/xml"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="ddt-file"
                        />
                        <label htmlFor="ddt-file">
                          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                            selectedFile ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}>
                            {selectedFile ? (
                              <>
                                <CheckCircle2 className="h-8 w-8 mx-auto mb-3 text-primary" />
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Drop file here or click to upload
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF or XML only
                                </p>
                              </>
                            )}
                          </div>
                        </label>
                      </CardContent>
                    </Card>

                    {/* Submit */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-hero shadow-elevated"
                      disabled={uploadDocument.isPending || !selectedFile}
                    >
                      {uploadDocument.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Submit Document
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Document History</CardTitle>
                  <CardDescription>
                    View all your submitted DDT documents and their verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>DDT Number</TableHead>
                          <TableHead>School</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Blockchain</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.ddt_number}</TableCell>
                            <TableCell>{doc.schools?.name || '-'}</TableCell>
                            <TableCell>
                              {doc.delivery_date ? format(new Date(doc.delivery_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={doc.status} size="sm" />
                            </TableCell>
                            <TableCell>
                              {doc.blockchain_tx_id ? (
                                <StatusBadge status="verified" size="sm" />
                              ) : (
                                <StatusBadge status="pending" size="sm" />
                              )}
                            </TableCell>
                            <TableCell>
                              {doc.status === 'verified' && !doc.blockchain_tx_id && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAnchorDocument(doc)}
                                  disabled={anchorToBlockchain.isPending}
                                >
                                  Anchor
                                </Button>
                              )}
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
        </div>
      </div>
    </Layout>
  );
}
