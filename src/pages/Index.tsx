import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  QrCode, 
  FileCheck, 
  Users, 
  ArrowRight,
  Leaf,
  Link as LinkIcon,
  CheckCircle2,
  Building2,
  Truck,
  UtensilsCrossed
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";

const features = [
  {
    icon: Shield,
    title: "Blockchain Verified",
    description: "SHA-256 hashing with public chain anchoring ensures tamper-proof document integrity.",
  },
  {
    icon: QrCode,
    title: "Instant QR Verification",
    description: "Parents scan a single QR code to access complete meal traceability instantly.",
  },
  {
    icon: FileCheck,
    title: "DDT Documentation",
    description: "Full Italian regulatory compliance with digital transport document management.",
  },
  {
    icon: Users,
    title: "Multi-Role Platform",
    description: "Dedicated portals for vendors, schools, administrators, and consumers.",
  },
];

const steps = [
  {
    icon: Truck,
    title: "Vendor Delivery",
    description: "Vendors upload DDT documents with photos upon food delivery to schools.",
  },
  {
    icon: Building2,
    title: "School Verification",
    description: "Schools verify deliveries and link ingredients to daily menus.",
  },
  {
    icon: LinkIcon,
    title: "Blockchain Anchoring",
    description: "Document hashes are stored privately and anchored publicly for immutability.",
  },
  {
    icon: UtensilsCrossed,
    title: "Consumer Access",
    description: "Parents scan QR codes to view complete ingredient traceability.",
  },
];

const stats = [
  { value: "156", label: "Schools Connected" },
  { value: "12,458", label: "Documents Verified" },
  { value: "342", label: "Trusted Vendors" },
  { value: "100%", label: "Traceability" },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero blockchain-pattern">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/20" />
        <div className="container relative py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Leaf className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                Blockchain-Verified Food Traceability
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              Complete Food Supply Chain Transparency
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl">
              From vendor to student meal — our blockchain-verified platform ensures complete 
              ingredient traceability for Italian school cafeterias. Build trust with parents 
              through cryptographic proof.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-elevated"
                asChild
              >
                <Link to="/verify">
                  <QrCode className="mr-2 h-5 w-5" />
                  Verify a Meal
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/vendor">
                  Start as Vendor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path 
              d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Trust Through Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our hybrid blockchain architecture combines fast private operations with 
              immutable public chain anchoring for complete food safety compliance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From delivery to verification, every step is documented and cryptographically secured.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative text-center"
                >
                  <div className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero text-primary-foreground shadow-elevated mb-4">
                    <step.icon className="h-7 w-7" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-blockchain blockchain-pattern relative overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-blockchain-foreground mb-4">
              Ready to Ensure Food Safety?
            </h2>
            <p className="text-lg text-blockchain-foreground/80 mb-8">
              Join hundreds of Italian schools already using blockchain-verified traceability. 
              Give parents the transparency they deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blockchain-foreground text-blockchain hover:bg-blockchain-foreground/90"
                asChild
              >
                <Link to="/school">
                  <Building2 className="mr-2 h-5 w-5" />
                  Register Your School
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-blockchain-foreground/30 text-blockchain-foreground hover:bg-blockchain-foreground/10"
                asChild
              >
                <Link to="/vendor">
                  <Truck className="mr-2 h-5 w-5" />
                  Become a Vendor
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-heading font-semibold text-lg mb-2">
                Fully Compliant
              </h3>
              <p className="text-muted-foreground">
                Designed for Italian food safety regulations
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-verified" />
                <span>DPR 472/96 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-verified" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-verified" />
                <span>DDT Documentation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-5 w-5 text-verified" />
                <span>SHA-256 Hashing</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
