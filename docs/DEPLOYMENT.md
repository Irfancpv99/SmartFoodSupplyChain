# Deployment Guide - Smart Food Supply Chain Platform

This guide provides step-by-step instructions for deploying the Smart Food Supply Chain platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2+** with extensions: mysqli, pdo_mysql, gd, json, curl, openssl
- **MySQL 8.0+**
- **Node.js 18+** and npm
- **Composer** (PHP dependency manager)
- **Web server** (Apache or Nginx) - for production
- **Git**

## Backend Setup

### 1. Install PHP Dependencies

```bash
cd backend
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

### 3. Create Upload Directories

```bash
mkdir -p ../uploads ../qr-codes
chmod 755 ../uploads ../qr-codes
```

## Database Setup

### 1. Create Database and Import Schema

```bash
mysql -u root -p
```

```sql
CREATE DATABASE smart_food_supply_chain CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

```bash
mysql -u root -p smart_food_supply_chain < database/schema.sql
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

### 2. Configure Environment

Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### 3. Build for Production

```bash
npm run build
```

## Running the Application

### Development Mode

#### Backend
```bash
cd backend/public
php -S localhost:8000
```

#### Frontend
```bash
cd frontend
npm start
```

Access: Frontend at http://localhost:3000, Backend API at http://localhost:8000/api/v1

### Default Login
- **Username:** admin
- **Password:** admin123

⚠️ **Change password after first login!**

## Production Deployment

See full deployment guide for production setup with Apache/Nginx, SSL, backups, and monitoring.

## Troubleshooting

**CORS Errors:** Update `CORS_ALLOWED_ORIGINS` in backend `.env`

**Database Connection:** Check credentials, ensure MySQL is running

**File Upload Fails:** Check directory permissions and PHP upload limits

**JWT Token Invalid:** Verify `JWT_SECRET` in `.env`, clear browser localStorage

## Support

GitHub Issues: https://github.com/Irfancpv99/SmartFoodSupplyChain/issues
