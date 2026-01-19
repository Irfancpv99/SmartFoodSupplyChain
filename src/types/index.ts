// User Roles
export type UserRole = 'super_admin' | 'administration' | 'vendor' | 'school' | 'consumer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

// School
export interface School {
  id: string;
  name: string;
  address: string;
  region: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor
export interface Vendor {
  id: string;
  companyName: string;
  vatNumber: string;
  address: string;
  contactEmail: string;
  verified: boolean;
  createdAt: Date;
}

// Product in DDT
export interface Product {
  name: string;
  quantity: number;
  unit: string;
  lotNumber?: string;
  expiryDate?: Date;
}

// DDT Document
export interface Document {
  id: string;
  ddtNumber: string;
  schoolId: string;
  vendorId: string;
  documentDate: Date;
  products: Product[];
  pdfPath?: string;
  photoPath?: string;
  createdAt: Date;
  hash?: string;
  verificationStatus: VerificationStatus;
}

// Menu Item Ingredient
export interface Ingredient {
  name: string;
  documentIds: string[];
}

// Menu Item
export interface MenuItem {
  name: string;
  ingredients: Ingredient[];
}

// Menu
export interface Menu {
  id: string;
  schoolId: string;
  menuDate: Date;
  menuType: 'daily' | 'weekly';
  items: MenuItem[];
  status: 'draft' | 'pending_verification' | 'published' | 'archived';
  publishedAt?: Date;
  qrCodePath?: string;
  menuHash?: string;
}

// Blockchain Record
export interface BlockchainRecord {
  id: string;
  documentId?: string;
  menuId?: string;
  hash: string;
  hashType: 'document' | 'menu';
  privateChainStoredAt: Date;
  publicChainTxHash?: string;
  publicChainAnchoredAt?: Date;
  verificationCount: number;
}

// Verification Status
export type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'expired' | 'rejected';

// Verification Result
export interface VerificationResult {
  hash: string;
  exists: boolean;
  type: 'document' | 'menu';
  privateChainTimestamp?: Date;
  publicChainTx?: string;
  publicChainBlock?: number;
  status: VerificationStatus;
}

// Menu Verification Response
export interface MenuVerificationResponse {
  menu: Menu;
  documents: (Document & { vendor: Vendor })[];
  verification: {
    privateChain: boolean;
    publicChain: boolean;
    lastVerified: Date;
    status: VerificationStatus;
  };
}

// Stats for Dashboard
export interface DashboardStats {
  totalSchools: number;
  totalVendors: number;
  totalDocuments: number;
  totalMenus: number;
  pendingVerifications: number;
  verifiedToday: number;
}
