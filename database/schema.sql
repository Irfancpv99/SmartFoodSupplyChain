-- Smart Food Supply Chain Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS smart_food_supply_chain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_food_supply_chain;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'vendor', 'school') NOT NULL,
    vendor_id INT DEFAULT NULL,
    school_id INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_vendor (vendor_id),
    INDEX idx_school (school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    region VARCHAR(100) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_region (region)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    vat_number VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vat (vat_number),
    INDEX idx_verified (verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vendor-School relationship (many-to-many)
CREATE TABLE IF NOT EXISTS vendor_schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    school_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_school (vendor_id, school_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documents (DDT/Invoices) table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ddt_number VARCHAR(100) NOT NULL,
    school_id INT NOT NULL,
    vendor_id INT NOT NULL,
    document_date DATE NOT NULL,
    products JSON NOT NULL,
    pdf_path VARCHAR(500),
    photo_path VARCHAR(500) NOT NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_ddt_school (ddt_number, school_id),
    INDEX idx_document_date (document_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menus table
CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    menu_date DATE NOT NULL,
    menu_type ENUM('daily', 'weekly') NOT NULL DEFAULT 'daily',
    items JSON NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    qr_code_path VARCHAR(500),
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE RESTRICT,
    INDEX idx_menu_date (menu_date),
    INDEX idx_status (status),
    INDEX idx_school_date (school_id, menu_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu-Document junction table (many-to-many)
CREATE TABLE IF NOT EXISTS menu_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_id INT NOT NULL,
    document_id INT NOT NULL,
    menu_item_name VARCHAR(255) NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE RESTRICT,
    INDEX idx_menu (menu_id),
    INDEX idx_document (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blockchain records table
CREATE TABLE IF NOT EXISTS blockchain_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT DEFAULT NULL,
    menu_id INT DEFAULT NULL,
    hash VARCHAR(64) NOT NULL UNIQUE,
    hash_type ENUM('document', 'menu') NOT NULL,
    private_chain_stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    public_chain_tx_hash VARCHAR(66),
    public_chain_block_number BIGINT,
    public_chain_anchored_at TIMESTAMP NULL,
    verification_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    INDEX idx_hash (hash),
    INDEX idx_hash_type (hash_type),
    INDEX idx_document (document_id),
    INDEX idx_menu (menu_id),
    CHECK ((document_id IS NOT NULL AND menu_id IS NULL) OR (document_id IS NULL AND menu_id IS NOT NULL))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - should be changed)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@smartfood.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Insert sample schools
INSERT INTO schools (name, address, region, contact_email, contact_phone) VALUES
('Scuola Primaria Milano Centro', 'Via Roma 123, 20100 Milano', 'Lombardia', 'info@scuolamilano.it', '+39 02 1234567'),
('Scuola Elementare Roma Nord', 'Via Napoli 45, 00100 Roma', 'Lazio', 'segreteria@scuolaroma.it', '+39 06 7654321');

-- Insert sample vendors
INSERT INTO vendors (company_name, vat_number, address, contact_email, contact_phone, verified) VALUES
('BioFood Italia S.r.l.', 'IT12345678901', 'Via Agricola 10, 20100 Milano', 'ordini@biofood.it', '+39 02 9876543', TRUE),
('FreshVeg Distributors', 'IT98765432109', 'Via Mercato 22, 00100 Roma', 'info@freshveg.it', '+39 06 1122334', TRUE);

-- Link vendors to schools
INSERT INTO vendor_schools (vendor_id, school_id) VALUES
(1, 1), (1, 2), (2, 1), (2, 2);
