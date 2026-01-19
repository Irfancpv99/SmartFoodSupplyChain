import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Mail, Lock, User, Building2, Truck, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user, hasRole, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (hasRole('admin')) {
        navigate('/admin');
      } else if (hasRole('vendor')) {
        navigate('/vendor');
      } else if (hasRole('school_admin')) {
        navigate('/school');
      } else {
        navigate('/');
      }
    }
  }, [user, authLoading, hasRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error("Login failed", {
          description: error.message,
        });
        setIsLoading(false);
      } else {
        toast.success("Login successful!", {
          description: "Redirecting to your dashboard...",
        });
        // Set a timeout to clear loading state if redirect doesn't happen within 3 seconds
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);
        // The useEffect above will handle the redirect based on roles
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        toast.error("Sign up failed", {
          description: error.message,
        });
      } else {
        toast.success("Account created!", {
          description: "You can now sign in with your credentials.",
        });
        setIsSignUp(false);
        setPassword("");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-muted/20 py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-hero shadow-elevated mb-4">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Sign up to access your portal" : "Sign in to access your portal"}
            </p>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="pt-6">
              {isSignUp ? (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@company.it"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-hero"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsSignUp(false)}
                  >
                    Already have an account? Sign in
                  </Button>
                </form>
              ) : (
                <Tabs defaultValue="vendor" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="vendor" className="gap-1.5">
                      <Truck className="h-4 w-4" />
                      <span className="hidden sm:inline">Vendor</span>
                    </TabsTrigger>
                    <TabsTrigger value="school" className="gap-1.5">
                      <Building2 className="h-4 w-4" />
                      <span className="hidden sm:inline">School</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="gap-1.5">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="vendor">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendor-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="vendor-email"
                            type="email"
                            placeholder="vendor@company.it"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendor-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="vendor-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-hero"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="school">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="school-email">School Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="school-email"
                            type="email"
                            placeholder="admin@school.edu.it"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="school-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="school-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-hero"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="admin">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin-email"
                            type="email"
                            placeholder="admin@smartfood.it"
                            className="pl-10"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin-password"
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-hero"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign in"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}

              {!isSignUp && (
                <>
                  <div className="mt-6 pt-6 border-t text-center">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setIsSignUp(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create new account
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link 
              to="/verify" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Parent/Consumer? Verify meals without login
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
