import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  School,
  Truck,
  FileText,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  TrendingUp,
  Shield,
  Activity,
  Loader2,
  Users,
  FileCheck
} from "lucide-react";
import { format } from "date-fns";
import { VerificationStatus } from "@/types";
import {
  useDashboardStats,
  useRecentDocuments,
  useRecentBlockchainRecords,
  useAllSchools,
  useAllVendors
} from "@/hooks/useAdminDashboard";
import { UserManagement } from "@/components/admin/UserManagement";
import { DocumentVerification } from "@/components/admin/DocumentVerification";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, hasRole } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentDocuments = [], isLoading: docsLoading } = useRecentDocuments();
  const { data: recentBlockchain = [], isLoading: blockchainLoading } = useRecentBlockchainRecords();
  const { data: schools = [], isLoading: schoolsLoading } = useAllSchools();
  const { data: vendors = [], isLoading: vendorsLoading } = useAllVendors();

  // Route guard: Check if user has admin role
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log('AdminDashboard: No user, redirecting to login');
        navigate('/login');
      } else if (!hasRole('admin')) {
        console.log('AdminDashboard: User lacks admin role, redirecting based on available roles');
        // Redirect to appropriate dashboard based on their role
        if (hasRole('vendor')) {
          navigate('/vendor');
        } else if (hasRole('school_admin')) {
          navigate('/school');
        } else {
          // User has no recognized roles, redirect to home
          console.warn('AdminDashboard: User has no recognized roles, redirecting to home');
          navigate('/');
        }
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  const statCards = [
    {
      title: "Total Schools",
      value: stats?.totalSchools ?? 0,
      icon: School,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Vendors",
      value: stats?.totalVendors ?? 0,
      icon: Truck,
      color: "text-blockchain",
      bgColor: "bg-blockchain/10",
    },
    {
      title: "Documents Verified",
      value: stats?.totalDocuments ?? 0,
      icon: FileText,
      color: "text-verified",
      bgColor: "bg-verified/10",
    },
    {
      title: "Menus Published",
      value: stats?.totalMenus ?? 0,
      icon: UtensilsCrossed,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const quickStats = [
    {
      label: "Pending Verifications",
      value: stats?.pendingVerifications ?? 0,
      icon: Clock,
      color: "text-pending",
    },
    {
      label: "Verified Today",
      value: stats?.verifiedToday ?? 0,
      icon: CheckCircle2,
      color: "text-verified",
    },
  ];

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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Only render if user has admin role
  if (!user || !hasRole('admin')) {
    return null;
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
                  <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground">
                    Admin Dashboard
                  </h1>
                  <p className="text-primary-foreground/70">
                    System overview and management
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="verification" className="gap-2">
                <FileCheck className="h-4 w-4" />
                Document Verification
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                          <TrendingUp className="h-4 w-4 text-verified" />
                        </div>
                        {statsLoading ? (
                          <Skeleton className="h-9 w-16 mb-1" />
                        ) : (
                          <div className="text-3xl font-heading font-bold mb-1">
                            {stat.value.toLocaleString()}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {stat.title}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats Row */}
              <div className="grid sm:grid-cols-2 gap-6">
                {quickStats.map((stat, index) => (
                  <Card key={index} className="shadow-card">
                    <CardContent className="p-6 flex items-center gap-4">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      <div>
                        {statsLoading ? (
                          <Skeleton className="h-8 w-12 mb-1" />
                        ) : (
                          <div className="text-2xl font-heading font-bold">
                            {stat.value}
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Documents */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Documents
                </CardTitle>
                <CardDescription>
                  Latest DDT uploads across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentDocuments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No documents yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>DDT</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium font-mono text-sm">
                            {doc.ddt_number}
                          </TableCell>
                          <TableCell>
                            {format(new Date(doc.upload_date), 'MMM d')}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={mapStatus(doc.status)} size="sm" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Activity */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blockchain" />
                  Blockchain Activity
                </CardTitle>
                <CardDescription>
                  Recent hash anchoring operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {blockchainLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentBlockchain.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No blockchain records yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBlockchain.map((record) => (
                      <div key={record.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="p-2 rounded-lg bg-blockchain/10">
                          <Activity className="h-4 w-4 text-blockchain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">
                              {record.record_type} Hash
                            </span>
                            <StatusBadge 
                              status={record.status === 'anchored' ? 'verified' : 'pending'} 
                              size="sm" 
                            />
                          </div>
                          <code className="text-xs text-muted-foreground block truncate">
                            {record.data_hash}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(record.created_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schools Overview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  Schools
                </CardTitle>
                <CardDescription>
                  Connected schools in the network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {schoolsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : schools.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <School className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No schools registered</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Students</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schools.slice(0, 5).map((school) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-medium">{school.name}</TableCell>
                          <TableCell>
                            {school.city ? `${school.city}, ${school.province}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {school.student_count || 0}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Vendors Overview */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Vendors
                </CardTitle>
                <CardDescription>
                  Registered food suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vendorsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No vendors registered</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.slice(0, 5).map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">
                            {vendor.business_name || vendor.name}
                          </TableCell>
                          <TableCell>
                            {vendor.city ? `${vendor.city}, ${vendor.province}` : '-'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={vendor.is_verified ? 'verified' : 'pending'} 
                              size="sm" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
            </TabsContent>

            <TabsContent value="verification">
              <DocumentVerification />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
