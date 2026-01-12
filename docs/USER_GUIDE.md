# User Guide - Smart Food Supply Chain Platform

This guide explains how to use the Smart Food Supply Chain platform for different user roles.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Vendor Portal](#vendor-portal)
3. [School Administration Portal](#school-administration-portal)
4. [Consumer Portal](#consumer-portal)

---

## Getting Started

### Accessing the Platform

1. Open your web browser
2. Navigate to the platform URL (e.g., http://localhost:3000 for development)
3. You'll see the Consumer Portal (public access) by default

### Logging In

For Vendor or School Administration access:

1. Click **Login** in the navigation bar
2. Enter your username and password
3. Click **Login**
4. You'll be redirected to your role-specific dashboard

**Default Demo Credentials:**
- Username: `admin`
- Password: `admin123`

---

## Vendor Portal

The Vendor Portal allows food suppliers to upload delivery documents (DDT/Invoices) with photos.

### Dashboard

After logging in as a vendor, you'll see:
- List of recently uploaded documents
- Document status (verified, pending, rejected)
- Quick access to upload new documents

### Uploading a Delivery Document

1. Click **Upload New Document** or navigate to **Upload Document** in the menu

2. Fill in the required information:
   - **DDT Number:** Enter the delivery document number (must be unique per school)
   - **Document Date:** Select the delivery date
   - **Vendor:** Your vendor is pre-selected if you're a vendor user
   - **School:** Select the destination school

3. Add Products:
   - Enter product name, quantity, and unit (e.g., "Tomatoes", "50", "kg")
   - Click **Add Product** to add more products
   - Click **Remove** to delete a product

4. Upload Files:
   - **Document Photo (Required):** Take or upload a photo of the physical document
     - Accepted formats: JPEG, PNG
     - Max size: 10MB
   - **PDF Document (Optional):** Upload a PDF copy if available
     - Max size: 25MB

5. Click **Upload Document**

6. Upon success:
   - You'll see a confirmation with the blockchain hash
   - The document is immediately verified and stored
   - You'll be redirected to your dashboard

### Document Status

- **Verified:** Document has been uploaded and blockchain hash generated
- **Pending:** Awaiting verification
- **Rejected:** Document rejected (contact admin)

---

## School Administration Portal

The School Administration Portal allows school staff to create menus and link them to verified delivery documents.

### Dashboard

After logging in as school admin, you'll see:
- Statistics: Total menus, published menus, verified documents
- Quick actions to create menus or view menu list
- Recent menus and delivery documents

### Viewing Delivery Documents

1. Navigate to your dashboard
2. Scroll to "Recent Delivery Documents" section
3. View all DDT/Invoices received from vendors
4. Check verification status and product details

### Creating a Menu

1. Click **Create New Menu** or navigate to **Menus > Create Menu**

2. Fill in menu information:
   - **School:** Your school is pre-selected if you're a school user
   - **Menu Date:** Select the date for this menu
   - **Menu Type:** Choose "Daily" or "Weekly"

3. Add Menu Items (Dishes):
   - Enter the dish name (e.g., "Pasta al Pomodoro")
   - Click **Add Menu Item** to add more dishes

4. Add Ingredients for each dish:
   - Enter ingredient name (e.g., "Tomatoes")
   - **Link DDT Documents:** Select at least one DDT that contains this ingredient
     - You'll see a list of all verified documents
     - Check the boxes for relevant DDTs
     - ⚠️ **Important:** Every ingredient MUST have at least one DDT linked
   - Click **Add Ingredient** to add more ingredients

5. Click **Create Menu**

6. The menu is created in "Draft" status

### Publishing a Menu

⚠️ **Critical:** A menu can only be published if ALL ingredients have at least one linked DDT.

1. Navigate to **Menus** list
2. Find the menu you want to publish (status: "Draft")
3. Click **Publish**
4. The system validates DDT coverage:
   - **If valid:** 
     - Menu is published
     - QR code is generated
     - Blockchain hash is created
     - Status changes to "Published"
   - **If invalid:**
     - You'll see an error listing missing DDT links
     - Fix the issues by editing the menu
     - Try publishing again

5. Once published:
   - Parents can scan the QR code to verify
   - Menu appears on the Consumer Portal
   - Cannot be edited (create a new menu instead)

### Viewing Published Menus

1. Navigate to **Menus** list
2. Published menus show a **View** button
3. Click **View** to see the public verification page
4. Share the QR code with parents/students

---

## Consumer Portal

The Consumer Portal is **public** - no login required. Parents and guardians can verify meal sources.

### Scanning a QR Code

1. Navigate to the platform homepage or **Verify Menu**
2. Click **📷 Scan QR Code**
3. Allow camera access when prompted
4. Point your camera at the menu QR code
5. The system automatically detects and verifies the menu
6. You'll see the complete menu verification page

### Manual Verification

If you have the Menu ID:

1. Navigate to **Verify Menu**
2. Scroll to "Enter Menu ID"
3. Type the menu ID number
4. Click **Verify Menu**

### Understanding the Verification Page

Once a menu is loaded, you'll see:

#### 1. Verification Status
- **✓ Verified on Public Blockchain:** Menu is fully verified
- **⏳ Verified - Pending Public Chain Anchoring:** Menu is verified but waiting for daily blockchain batch
- **✗ Not Verified:** Menu not found or verification failed

#### 2. School Information
- School name, address, and region
- Menu date and type (daily/weekly)

#### 3. Menu Items
For each dish, you'll see:
- Dish name
- List of ingredients
- For each ingredient:
  - DDT document number
  - Vendor name
  - Delivery date
  - Blockchain verification status

#### 4. Supplier Information
- List of all vendors who supplied ingredients
- Vendor contact information
- VAT number and address

#### 5. QR Code
- The menu's QR code for sharing

### What Does Blockchain Verification Mean?

**Blockchain verification ensures:**
- The menu data hasn't been tampered with
- All ingredients are traceable to verified delivery documents
- Vendor information is authentic
- Complete transparency in the food supply chain

**Private Chain:** Data stored in the system's secure database (instant verification)

**Public Chain:** Data anchored to a public blockchain like Ethereum (immutable proof, updated daily)

---

## Tips and Best Practices

### For Vendors
- Upload documents immediately after delivery
- Take clear photos of DDT documents
- Double-check product information before uploading
- Keep PDF copies as backup

### For School Administrators
- Create menus in advance
- Ensure all delivery documents are received before creating menus
- Verify DDT coverage before attempting to publish
- Communicate with vendors if documents are missing
- Share QR codes with parents via school communication channels

### For Parents/Consumers
- Scan QR codes regularly to stay informed
- Check vendor information for allergen concerns
- Contact school if you have questions about ingredients
- Share the verification link with other parents

---

## Troubleshooting

### Cannot Upload Document
- Check file size limits (10MB for photos, 25MB for PDFs)
- Ensure you're using JPEG/PNG for photos
- Verify you have permission as a vendor

### Cannot Publish Menu
- Check that ALL ingredients have at least one DDT linked
- Read the error message carefully - it tells you which items are missing DDTs
- Ensure all linked documents are verified

### QR Code Won't Scan
- Ensure good lighting
- Hold camera steady
- Try manual verification with Menu ID instead
- Clear your browser cache

### Verification Shows "Not Found"
- Menu might not be published yet
- Check the Menu ID is correct
- Contact school administration

---

## Support

For technical issues or questions:
- Contact your school administrator
- Report issues on GitHub: https://github.com/Irfancpv99/SmartFoodSupplyChain/issues

## Security Note

- Never share your login credentials
- Log out after using the system on shared devices
- Report suspicious activity to administrators
- Change your password regularly
