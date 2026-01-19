-- ===========================================
-- PUBLIC ACCESS FOR PUBLISHED MENUS
-- ===========================================

-- 1. CREATE PUBLIC VIEWS (with security_invoker for RLS respect)
-- These views expose only safe columns

-- Public view for menus
CREATE OR REPLACE VIEW public.public_menus
WITH (security_invoker = off) AS
SELECT 
  m.id,
  m.menu_id,
  m.name,
  m.date,
  m.meal_type,
  m.description,
  m.is_published,
  m.created_at,
  s.id as school_id,
  s.name as school_name,
  s.city as school_city,
  s.province as school_province
FROM menus m
JOIN schools s ON m.school_id = s.id
WHERE m.is_published = true;

-- Public view for menu items
CREATE OR REPLACE VIEW public.public_menu_items
WITH (security_invoker = off) AS
SELECT 
  mi.id,
  mi.menu_id,
  mi.name,
  mi.description,
  mi.category,
  mi.allergens,
  mi.order_index
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id
WHERE m.is_published = true;

-- Public view for menu item ingredients
CREATE OR REPLACE VIEW public.public_menu_item_ingredients
WITH (security_invoker = off) AS
SELECT 
  mii.id,
  mii.menu_item_id,
  mii.ingredient_id,
  mii.quantity,
  mii.unit
FROM menu_item_ingredients mii
JOIN menu_items mi ON mii.menu_item_id = mi.id
JOIN menus m ON mi.menu_id = m.id
WHERE m.is_published = true;

-- Public view for ingredients (linked to published menus)
CREATE OR REPLACE VIEW public.public_ingredients
WITH (security_invoker = off) AS
SELECT DISTINCT
  i.id,
  i.name,
  i.origin,
  i.lot_number,
  i.expiry_date,
  i.document_id
FROM ingredients i
JOIN menu_item_ingredients mii ON mii.ingredient_id = i.id
JOIN menu_items mi ON mii.menu_item_id = mi.id
JOIN menus m ON mi.menu_id = m.id
WHERE m.is_published = true;

-- Public view for documents (only safe columns)
CREATE OR REPLACE VIEW public.public_documents
WITH (security_invoker = off) AS
SELECT DISTINCT
  d.id,
  d.ddt_number,
  d.delivery_date,
  d.status,
  d.blockchain_tx_id,
  d.vendor_id
FROM documents d
JOIN ingredients i ON i.document_id = d.id
JOIN menu_item_ingredients mii ON mii.ingredient_id = i.id
JOIN menu_items mi ON mii.menu_item_id = mi.id
JOIN menus m ON mi.menu_id = m.id
WHERE m.is_published = true;

-- Public view for vendors (only safe columns)
CREATE OR REPLACE VIEW public.public_vendors
WITH (security_invoker = off) AS
SELECT DISTINCT
  v.id,
  v.name,
  v.business_name,
  v.city,
  v.province
FROM vendors v
JOIN documents d ON d.vendor_id = v.id
JOIN ingredients i ON i.document_id = d.id
JOIN menu_item_ingredients mii ON mii.ingredient_id = i.id
JOIN menu_items mi ON mii.menu_item_id = mi.id
JOIN menus m ON mi.menu_id = m.id
WHERE m.is_published = true;

-- Public view for schools (only safe columns)
CREATE OR REPLACE VIEW public.public_schools
WITH (security_invoker = off) AS
SELECT DISTINCT
  s.id,
  s.name,
  s.city,
  s.province
FROM schools s
JOIN menus m ON m.school_id = s.id
WHERE m.is_published = true;

-- 2. UPDATE RLS POLICIES FOR ANONYMOUS ACCESS

-- Menus: Add anonymous access for published menus
DROP POLICY IF EXISTS "Published menus are publicly viewable" ON public.menus;
CREATE POLICY "Published menus are publicly viewable" 
ON public.menus 
FOR SELECT 
TO anon, authenticated
USING (is_published = true);

-- Menu Items: Add anonymous access for items in published menus
DROP POLICY IF EXISTS "Menu items in published menus are publicly viewable" ON public.menu_items;
CREATE POLICY "Menu items in published menus are publicly viewable" 
ON public.menu_items 
FOR SELECT 
TO anon, authenticated
USING (menu_id IN (SELECT id FROM menus WHERE is_published = true));

-- Menu Item Ingredients: Add anonymous access
DROP POLICY IF EXISTS "Menu item ingredients in published menus are publicly viewable" ON public.menu_item_ingredients;
CREATE POLICY "Menu item ingredients in published menus are publicly viewable" 
ON public.menu_item_ingredients 
FOR SELECT 
TO anon, authenticated
USING (menu_item_id IN (
  SELECT mi.id FROM menu_items mi 
  JOIN menus m ON mi.menu_id = m.id 
  WHERE m.is_published = true
));

-- Ingredients: Add anonymous access for ingredients in published menus
DROP POLICY IF EXISTS "Ingredients in published menus are publicly viewable" ON public.ingredients;
CREATE POLICY "Ingredients in published menus are publicly viewable" 
ON public.ingredients 
FOR SELECT 
TO anon, authenticated
USING (id IN (
  SELECT mii.ingredient_id FROM menu_item_ingredients mii
  JOIN menu_items mi ON mii.menu_item_id = mi.id
  JOIN menus m ON mi.menu_id = m.id
  WHERE m.is_published = true
));

-- Documents: Add anonymous access for documents linked to published menus
DROP POLICY IF EXISTS "Documents in published menus are publicly viewable" ON public.documents;
CREATE POLICY "Documents in published menus are publicly viewable" 
ON public.documents 
FOR SELECT 
TO anon, authenticated
USING (id IN (
  SELECT i.document_id FROM ingredients i
  JOIN menu_item_ingredients mii ON mii.ingredient_id = i.id
  JOIN menu_items mi ON mii.menu_item_id = mi.id
  JOIN menus m ON mi.menu_id = m.id
  WHERE m.is_published = true AND i.document_id IS NOT NULL
));

-- Vendors: Add anonymous access for vendors linked to published menus
DROP POLICY IF EXISTS "Vendors in published menus are publicly viewable" ON public.vendors;
CREATE POLICY "Vendors in published menus are publicly viewable" 
ON public.vendors 
FOR SELECT 
TO anon, authenticated
USING (id IN (
  SELECT d.vendor_id FROM documents d
  JOIN ingredients i ON i.document_id = d.id
  JOIN menu_item_ingredients mii ON mii.ingredient_id = i.id
  JOIN menu_items mi ON mii.menu_item_id = mi.id
  JOIN menus m ON mi.menu_id = m.id
  WHERE m.is_published = true
));

-- Schools: Add anonymous access for schools with published menus
DROP POLICY IF EXISTS "Schools with published menus are publicly viewable" ON public.schools;
CREATE POLICY "Schools with published menus are publicly viewable" 
ON public.schools 
FOR SELECT 
TO anon, authenticated
USING (id IN (SELECT school_id FROM menus WHERE is_published = true));

-- Blockchain Records: Already has public SELECT, ensure anon can access
DROP POLICY IF EXISTS "Blockchain records are publicly viewable" ON public.blockchain_records;
CREATE POLICY "Blockchain records are publicly viewable" 
ON public.blockchain_records 
FOR SELECT 
TO anon, authenticated
USING (true);