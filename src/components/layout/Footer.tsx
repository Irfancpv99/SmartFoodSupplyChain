import { Link } from "react-router-dom";
import { Leaf, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold leading-none">
                  SmartFood
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Supply Chain
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Blockchain-verified food traceability for Italian school cafeterias. 
              Ensuring transparency from vendor to student meal.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/vendor" className="text-muted-foreground hover:text-foreground transition-colors">
                  Vendor Portal
                </Link>
              </li>
              <li>
                <Link to="/school" className="text-muted-foreground hover:text-foreground transition-colors">
                  School Administration
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
                  Consumer Verification
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Documentation <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  API Reference <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Compliance Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  GDPR Compliance
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Smart Food Supply Chain. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Compliant with Italian DPR 472/96 • GDPR Ready
          </p>
        </div>
      </div>
    </footer>
  );
}
