-- ===========================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ===========================================
-- This migration removes circular dependencies in RLS policies
-- that cause infinite recursion and 500 errors.
-- The new policies are simplified and avoid cross-table references.

-- ===========================================
-- 1. DROP PROBLEMATIC POLICIES
-- ===========================================

-- Drop policies from documents table
DROP POLICY IF EXISTS "Documents are viewable by authenticated users" ON public.documents;
DROP POLICY IF EXISTS "Documents in published menus are publicly viewable" ON public.documents;
DROP POLICY IF EXISTS "Vendors can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Vendors can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;

-- Drop policies from vendors table
DROP POLICY IF EXISTS "Vendors are viewable by all authenticated users" ON public.vendors;
DROP POLICY IF EXISTS "Vendors in published menus are publicly viewable" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update their own record" ON public.vendors;
DROP POLICY IF EXISTS "Admins can manage all vendors" ON public.vendors;

-- Drop policies from ingredients table
DROP POLICY IF EXISTS "Ingredients are viewable by authenticated users" ON public.ingredients;
DROP POLICY IF EXISTS "Ingredients in published menus are publicly viewable" ON public.ingredients;
DROP POLICY IF EXISTS "Vendors can manage ingredients from their documents" ON public.ingredients;
DROP POLICY IF EXISTS "Admins can manage all ingredients" ON public.ingredients;

-- Drop policies from menu_item_ingredients table
DROP POLICY IF EXISTS "Menu item ingredients are publicly viewable for published menus" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "Menu item ingredients in published menus are publicly viewable" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "Authenticated users can view all menu item ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "School admins can manage their menu item ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "Admins can manage all menu item ingredients" ON public.menu_item_ingredients;

-- Drop policies from menu_items table
DROP POLICY IF EXISTS "Menu items are publicly viewable for published menus" ON public.menu_items;
DROP POLICY IF EXISTS "Menu items in published menus are publicly viewable" ON public.menu_items;
DROP POLICY IF EXISTS "Authenticated users can view all menu items" ON public.menu_items;
DROP POLICY IF EXISTS "School admins can manage their menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can manage all menu items" ON public.menu_items;

-- Drop policies from menus table
DROP POLICY IF EXISTS "Menus are publicly viewable when published" ON public.menus;
DROP POLICY IF EXISTS "Published menus are publicly viewable" ON public.menus;
DROP POLICY IF EXISTS "Authenticated users can view all menus" ON public.menus;
DROP POLICY IF EXISTS "School admins can manage their school menus" ON public.menus;
DROP POLICY IF EXISTS "Admins can manage all menus" ON public.menus;

-- Drop policies from schools table
DROP POLICY IF EXISTS "Schools are viewable by all authenticated users" ON public.schools;
DROP POLICY IF EXISTS "Schools with published menus are publicly viewable" ON public.schools;
DROP POLICY IF EXISTS "Admins can manage all schools" ON public.schools;
DROP POLICY IF EXISTS "School admins can update their own school" ON public.schools;

-- ===========================================
-- 2. CREATE SIMPLIFIED RLS POLICIES
-- ===========================================

-- -------------------------------------------
-- VENDORS TABLE
-- -------------------------------------------
-- Authenticated users can view all vendors
CREATE POLICY "Vendors: authenticated can view all"
ON public.vendors FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view verified vendors
CREATE POLICY "Vendors: public can view verified"
ON public.vendors FOR SELECT
TO anon
USING (is_verified = true);

-- Vendors can update their own record
CREATE POLICY "Vendors: users can update own record"
ON public.vendors FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can manage all vendors
CREATE POLICY "Vendors: admins can manage all"
ON public.vendors FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------
-- DOCUMENTS TABLE
-- -------------------------------------------
-- Authenticated users can view all documents
CREATE POLICY "Documents: authenticated can view all"
ON public.documents FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view verified documents
CREATE POLICY "Documents: public can view verified"
ON public.documents FOR SELECT
TO anon
USING (status = 'verified');

-- Vendors can insert their own documents
CREATE POLICY "Documents: vendors can insert own"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (vendor_id = public.get_user_vendor_id(auth.uid()));

-- Vendors can update their own documents
CREATE POLICY "Documents: vendors can update own"
ON public.documents FOR UPDATE
TO authenticated
USING (vendor_id = public.get_user_vendor_id(auth.uid()))
WITH CHECK (vendor_id = public.get_user_vendor_id(auth.uid()));

-- Admins can manage all documents
CREATE POLICY "Documents: admins can manage all"
ON public.documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- -------------------------------------------
-- INGREDIENTS TABLE
-- -------------------------------------------
-- Authenticated users can view all ingredients
CREATE POLICY "Ingredients: authenticated can view all"
ON public.ingredients FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view all ingredients
CREATE POLICY "Ingredients: public can view all"
ON public.ingredients FOR SELECT
TO anon
USING (true);

-- Authenticated users can insert ingredients
CREATE POLICY "Ingredients: authenticated can insert"
ON public.ingredients FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update ingredients
CREATE POLICY "Ingredients: authenticated can update"
ON public.ingredients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete ingredients
CREATE POLICY "Ingredients: authenticated can delete"
ON public.ingredients FOR DELETE
TO authenticated
USING (true);

-- -------------------------------------------
-- MENU_ITEM_INGREDIENTS TABLE
-- -------------------------------------------
-- Authenticated users can view all menu item ingredients
CREATE POLICY "Menu item ingredients: authenticated can view all"
ON public.menu_item_ingredients FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view all menu item ingredients
CREATE POLICY "Menu item ingredients: public can view all"
ON public.menu_item_ingredients FOR SELECT
TO anon
USING (true);

-- Authenticated users can insert menu item ingredients
CREATE POLICY "Menu item ingredients: authenticated can insert"
ON public.menu_item_ingredients FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update menu item ingredients
CREATE POLICY "Menu item ingredients: authenticated can update"
ON public.menu_item_ingredients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete menu item ingredients
CREATE POLICY "Menu item ingredients: authenticated can delete"
ON public.menu_item_ingredients FOR DELETE
TO authenticated
USING (true);

-- -------------------------------------------
-- MENU_ITEMS TABLE
-- -------------------------------------------
-- Authenticated users can view all menu items
CREATE POLICY "Menu items: authenticated can view all"
ON public.menu_items FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view all menu items
CREATE POLICY "Menu items: public can view all"
ON public.menu_items FOR SELECT
TO anon
USING (true);

-- Authenticated users can insert menu items
CREATE POLICY "Menu items: authenticated can insert"
ON public.menu_items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update menu items
CREATE POLICY "Menu items: authenticated can update"
ON public.menu_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete menu items
CREATE POLICY "Menu items: authenticated can delete"
ON public.menu_items FOR DELETE
TO authenticated
USING (true);

-- -------------------------------------------
-- MENUS TABLE
-- -------------------------------------------
-- Authenticated users can view all menus
CREATE POLICY "Menus: authenticated can view all"
ON public.menus FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view published menus
CREATE POLICY "Menus: public can view published"
ON public.menus FOR SELECT
TO anon
USING (is_published = true);

-- Authenticated users can insert menus
CREATE POLICY "Menus: authenticated can insert"
ON public.menus FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update menus
CREATE POLICY "Menus: authenticated can update"
ON public.menus FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete menus
CREATE POLICY "Menus: authenticated can delete"
ON public.menus FOR DELETE
TO authenticated
USING (true);

-- -------------------------------------------
-- SCHOOLS TABLE
-- -------------------------------------------
-- Authenticated users can view all schools
CREATE POLICY "Schools: authenticated can view all"
ON public.schools FOR SELECT
TO authenticated
USING (true);

-- Anonymous users can view all schools
CREATE POLICY "Schools: public can view all"
ON public.schools FOR SELECT
TO anon
USING (true);

-- Admins can manage all schools
CREATE POLICY "Schools: admins can manage all"
ON public.schools FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- School admins can update their own school
CREATE POLICY "Schools: school admins can update own"
ON public.schools FOR UPDATE
TO authenticated
USING (admin_user_id = auth.uid())
WITH CHECK (admin_user_id = auth.uid());
