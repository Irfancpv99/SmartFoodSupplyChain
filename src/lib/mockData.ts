import { School, Vendor, Document, Menu, BlockchainRecord, DashboardStats, VerificationStatus } from '@/types';

// Mock Schools
export const mockSchools: School[] = [
  {
    id: 'school-1',
    name: 'Scuola Primaria Leonardo da Vinci',
    address: 'Via Roma 123, 00100 Roma',
    region: 'Lazio',
    contactEmail: 'info@davinci.edu.it',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-10'),
  },
  {
    id: 'school-2',
    name: 'Istituto Comprensivo Galileo Galilei',
    address: 'Via Firenze 45, 50100 Firenze',
    region: 'Toscana',
    contactEmail: 'segreteria@galilei.edu.it',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2025-01-08'),
  },
  {
    id: 'school-3',
    name: 'Scuola Elementare Giuseppe Verdi',
    address: 'Corso Italia 78, 20100 Milano',
    region: 'Lombardia',
    contactEmail: 'admin@verdi.edu.it',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2025-01-12'),
  },
];

// Mock Vendors
export const mockVendors: Vendor[] = [
  {
    id: 'vendor-1',
    companyName: 'Azienda Agricola Bella Italia',
    vatNumber: 'IT12345678901',
    address: 'Via Campagna 10, 00100 Roma',
    contactEmail: 'ordini@bellaitalia.it',
    verified: true,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'vendor-2',
    companyName: 'Caseificio Toscano SRL',
    vatNumber: 'IT98765432101',
    address: 'Via Formaggi 25, 50100 Firenze',
    contactEmail: 'vendite@caseificiotoscano.it',
    verified: true,
    createdAt: new Date('2024-01-12'),
  },
  {
    id: 'vendor-3',
    companyName: 'Macelleria Fratelli Rossi',
    vatNumber: 'IT11223344556',
    address: 'Via Carni 8, 20100 Milano',
    contactEmail: 'info@fratellirossi.it',
    verified: true,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'vendor-4',
    companyName: 'Pastificio Artisan',
    vatNumber: 'IT55667788990',
    address: 'Via Pasta 15, 80100 Napoli',
    contactEmail: 'pasta@artisan.it',
    verified: false,
    createdAt: new Date('2024-03-15'),
  },
];

// Mock Documents (DDT)
export const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    ddtNumber: 'DDT-2025-001',
    schoolId: 'school-1',
    vendorId: 'vendor-1',
    documentDate: new Date('2025-01-10'),
    products: [
      { name: 'Pomodori San Marzano', quantity: 50, unit: 'kg', lotNumber: 'LOT-2025-A1' },
      { name: 'Zucchine', quantity: 30, unit: 'kg', lotNumber: 'LOT-2025-A2' },
      { name: 'Carote Biologiche', quantity: 25, unit: 'kg', lotNumber: 'LOT-2025-A3' },
    ],
    pdfPath: '/documents/ddt-2025-001.pdf',
    photoPath: '/photos/ddt-2025-001.jpg',
    createdAt: new Date('2025-01-10T08:30:00'),
    hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
    verificationStatus: 'verified',
  },
  {
    id: 'doc-2',
    ddtNumber: 'DDT-2025-002',
    schoolId: 'school-1',
    vendorId: 'vendor-2',
    documentDate: new Date('2025-01-11'),
    products: [
      { name: 'Mozzarella Fresca', quantity: 20, unit: 'kg', lotNumber: 'LOT-MZ-001' },
      { name: 'Parmigiano Reggiano DOP', quantity: 10, unit: 'kg', lotNumber: 'LOT-PR-002' },
    ],
    pdfPath: '/documents/ddt-2025-002.pdf',
    createdAt: new Date('2025-01-11T09:15:00'),
    hash: 'b2c3d4e5f6789012345678901234567890abcde',
    verificationStatus: 'verified',
  },
  {
    id: 'doc-3',
    ddtNumber: 'DDT-2025-003',
    schoolId: 'school-1',
    vendorId: 'vendor-3',
    documentDate: new Date('2025-01-12'),
    products: [
      { name: 'Petto di Pollo', quantity: 40, unit: 'kg', lotNumber: 'LOT-PC-001' },
      { name: 'Macinato di Manzo', quantity: 25, unit: 'kg', lotNumber: 'LOT-MM-001' },
    ],
    createdAt: new Date('2025-01-12T07:45:00'),
    hash: 'c3d4e5f6789012345678901234567890abcdef',
    verificationStatus: 'pending',
  },
  {
    id: 'doc-4',
    ddtNumber: 'DDT-2025-004',
    schoolId: 'school-2',
    vendorId: 'vendor-4',
    documentDate: new Date('2025-01-12'),
    products: [
      { name: 'Pasta Penne Rigate', quantity: 50, unit: 'kg', lotNumber: 'LOT-PP-001' },
      { name: 'Spaghetti N.5', quantity: 50, unit: 'kg', lotNumber: 'LOT-SP-001' },
    ],
    createdAt: new Date('2025-01-12T10:00:00'),
    verificationStatus: 'unverified',
  },
];

// Mock Menus
export const mockMenus: Menu[] = [
  {
    id: 'menu-1',
    schoolId: 'school-1',
    menuDate: new Date('2025-01-13'),
    menuType: 'daily',
    items: [
      {
        name: 'Pasta al Pomodoro',
        ingredients: [
          { name: 'Pasta Penne', documentIds: ['doc-4'] },
          { name: 'Pomodori San Marzano', documentIds: ['doc-1'] },
          { name: 'Parmigiano Reggiano', documentIds: ['doc-2'] },
        ],
      },
      {
        name: 'Petto di Pollo alla Griglia',
        ingredients: [
          { name: 'Petto di Pollo', documentIds: ['doc-3'] },
          { name: 'Zucchine', documentIds: ['doc-1'] },
        ],
      },
      {
        name: 'Insalata di Carote',
        ingredients: [
          { name: 'Carote Biologiche', documentIds: ['doc-1'] },
        ],
      },
    ],
    status: 'published',
    publishedAt: new Date('2025-01-12T14:00:00'),
    qrCodePath: '/qr/menu-1.png',
    menuHash: 'menuHash123456789abcdef',
  },
  {
    id: 'menu-2',
    schoolId: 'school-1',
    menuDate: new Date('2025-01-14'),
    menuType: 'daily',
    items: [
      {
        name: 'Pizza Margherita',
        ingredients: [
          { name: 'Mozzarella Fresca', documentIds: ['doc-2'] },
          { name: 'Pomodori San Marzano', documentIds: ['doc-1'] },
        ],
      },
    ],
    status: 'draft',
  },
];

// Mock Blockchain Records
export const mockBlockchainRecords: BlockchainRecord[] = [
  {
    id: 'bc-1',
    documentId: 'doc-1',
    hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
    hashType: 'document',
    privateChainStoredAt: new Date('2025-01-10T08:30:05'),
    publicChainTxHash: '0x1234567890abcdef1234567890abcdef12345678',
    publicChainAnchoredAt: new Date('2025-01-11T02:00:00'),
    verificationCount: 45,
  },
  {
    id: 'bc-2',
    documentId: 'doc-2',
    hash: 'b2c3d4e5f6789012345678901234567890abcde',
    hashType: 'document',
    privateChainStoredAt: new Date('2025-01-11T09:15:10'),
    publicChainTxHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    publicChainAnchoredAt: new Date('2025-01-12T02:00:00'),
    verificationCount: 32,
  },
  {
    id: 'bc-3',
    menuId: 'menu-1',
    hash: 'menuHash123456789abcdef',
    hashType: 'menu',
    privateChainStoredAt: new Date('2025-01-12T14:00:05'),
    publicChainTxHash: '0x567890abcdef1234567890abcdef1234567890ab',
    publicChainAnchoredAt: new Date('2025-01-13T02:00:00'),
    verificationCount: 128,
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalSchools: 156,
  totalVendors: 342,
  totalDocuments: 12458,
  totalMenus: 8234,
  pendingVerifications: 23,
  verifiedToday: 89,
};

// Helper function to get vendor by ID
export const getVendorById = (id: string): Vendor | undefined => {
  return mockVendors.find(v => v.id === id);
};

// Helper function to get school by ID
export const getSchoolById = (id: string): School | undefined => {
  return mockSchools.find(s => s.id === id);
};

// Helper function to get documents by school ID
export const getDocumentsBySchoolId = (schoolId: string): Document[] => {
  return mockDocuments.filter(d => d.schoolId === schoolId);
};

// Helper function to get menus by school ID
export const getMenusBySchoolId = (schoolId: string): Menu[] => {
  return mockMenus.filter(m => m.schoolId === schoolId);
};

// Helper function to verify a menu
export const verifyMenu = (menuId: string) => {
  const menu = mockMenus.find(m => m.id === menuId);
  const blockchainRecord = mockBlockchainRecords.find(bc => bc.menuId === menuId);
  
  if (!menu || !blockchainRecord) {
    return null;
  }

  const linkedDocuments = menu.items.flatMap(item => 
    item.ingredients.flatMap(ing => ing.documentIds)
  );
  
  const uniqueDocIds = [...new Set(linkedDocuments)];
  const documents = mockDocuments.filter(d => uniqueDocIds.includes(d.id));
  
  const documentsWithVendors = documents.map(doc => ({
    ...doc,
    vendor: getVendorById(doc.vendorId)!,
  }));

  return {
    menu,
    documents: documentsWithVendors,
    verification: {
      privateChain: true,
      publicChain: !!blockchainRecord.publicChainTxHash,
      lastVerified: new Date(),
      status: 'verified' as VerificationStatus,
    },
  };
};
