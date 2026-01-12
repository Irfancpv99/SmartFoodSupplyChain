# Smart Food Supply Chain Platform

A comprehensive food traceability system designed for school cafeterias with blockchain verification.

## Overview

The Smart Food Supply Chain platform creates an auditable, blockchain-verified chain of custody from food vendors to meals served to students, ensuring transparency, food safety compliance, and parent trust.

## Features

- **Complete Ingredient Traceability**: Track food from vendor to student meal
- **Blockchain Verification**: Tamper-proof document verification using hybrid blockchain
- **QR Code Verification**: Parents verify meal sources via simple QR scanning
- **DDT Compliance**: Ensures compliance with Italian food safety regulations
- **Three Portals**:
  - Vendor Portal: Document upload and delivery management
  - School Administration: Menu creation and verification
  - Consumer Portal: Public menu viewing and verification (no login required)

## Technology Stack

- **Frontend**: React 18+ with modern UI/UX
- **Backend**: PHP 8.2+ RESTful API
- **Database**: MySQL 8.0+
- **Blockchain**: Hybrid (Private MySQL + Public Chain Anchoring)
- **Security**: SHA-256 hashing, JWT authentication

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PHP 8.2+
- MySQL 8.0+
- Web server (Apache/Nginx)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Irfancpv99/SmartFoodSupplyChain.git
cd SmartFoodSupplyChain
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
composer install
```

4. Configure database:
```bash
mysql -u root -p < database/schema.sql
```

5. Configure environment:
```bash
cp backend/.env.example backend/.env
# Edit .env with your database credentials
```

6. Start development servers:
```bash
# Frontend (in frontend directory)
npm start

# Backend (in backend directory)
php -S localhost:8000 -t public
```

## Project Structure

```
SmartFoodSupplyChain/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components (Vendor, School, Consumer)
│   │   ├── services/     # API service layer
│   │   ├── utils/        # Utility functions
│   │   └── App.js        # Main application
│   └── public/           # Static assets
├── backend/              # PHP backend API
│   ├── src/
│   │   ├── api/         # API endpoints
│   │   ├── models/      # Data models
│   │   ├── services/    # Business logic
│   │   └── utils/       # Helper functions
│   └── public/          # Public entry point
├── database/            # Database schemas and migrations
└── docs/                # Documentation
```

## User Roles

- **Super Admin**: Full system control
- **Administration**: Operational management
- **Vendor**: Document upload and delivery management
- **School**: Receipt and menu management
- **Family/Student**: Public read-only access (no login required)

## Key Workflows

### 1. Document Upload (Vendor → School)
1. Vendor delivers products
2. Upload DDT/Invoice with photo
3. System generates SHA-256 hash
4. Hash stored in private chain (MySQL)
5. Queued for public blockchain anchoring

### 2. Menu Publication (School)
1. Create menu with items
2. Link ingredients to verified DDTs
3. Validate DDT coverage
4. Generate combined hash
5. Create single QR code
6. Publish to consumer portal

### 3. Verification (Consumer)
1. Scan QR code
2. View complete menu
3. Check blockchain verification
4. View DDT details and vendor info

## API Documentation

### Authentication
All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Key Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/documents` - Upload DDT/Invoice
- `POST /api/v1/menus` - Create menu
- `POST /api/v1/menus/{id}/publish` - Publish menu
- `GET /api/v1/verify/menu/{id}` - Verify menu (public)
- `GET /api/v1/verify/hash/{hash}` - Verify hash (public)

## Security

- JWT-based authentication for admin portals
- SHA-256 hashing for all documents
- Composite hashes (content + photo + timestamp)
- Public blockchain anchoring for immutability
- Role-based access control (RBAC)

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
