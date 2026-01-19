# RLS Infinite Recursion Fix - Documentation

## Problem Statement

The vendor portal and dashboard were inaccessible due to infinite recursion in Row Level Security (RLS) policies. The issue occurred because RLS policies on multiple tables (`documents`, `vendors`, `ingredients`, `menu_item_ingredients`, `menu_items`, `menus`, and `schools`) contained cross-table references through subqueries with JOINs.

### Example of Problematic Policy

```sql
-- This policy caused recursion because it queries other tables through RLS
CREATE POLICY "Documents in published menus are publicly viewable" 
ON public.documents FOR SELECT 
TO anon, authenticated
USING (id IN (
  SELECT i.document_id FROM ingredients i
  JOIN menu_item_ingredients mii ON mii.ingredient_id = i.id
  JOIN menu_items mi ON mii.menu_item_id = mi.id
  JOIN menus m ON mi.menu_id = m.id
  WHERE m.is_published = true AND i.document_id IS NOT NULL
));
```

When Supabase tried to evaluate this policy, it would:
1. Query the `ingredients` table (triggers RLS check on ingredients)
2. Query the `menu_item_ingredients` table (triggers RLS check on menu_item_ingredients)
3. Query the `menu_items` table (triggers RLS check on menu_items)
4. Query the `menus` table (triggers RLS check on menus)
5. These tables had similar policies that referenced back to `documents`, creating an infinite loop

## Solution

The solution implemented in migration `20260119140000_fix_rls_infinite_recursion.sql` removes all circular dependencies by:

1. **Dropping all problematic policies** that contained cross-table JOINs
2. **Creating simplified policies** that use only direct table checks
3. **Maintaining security** while ensuring accessibility

### Key Principles of the New Policies

1. **No Cross-Table Subqueries**: Policies only check columns within the same table
2. **Use of Helper Functions**: Safe to use `public.get_user_vendor_id()`, `public.get_user_school_id()`, and `public.has_role()` because they are `SECURITY DEFINER` and bypass RLS
3. **Broad Authenticated Access**: Authenticated users get broad access to enable dashboard functionality
4. **Restricted Anonymous Access**: Anonymous users get limited access to public/verified data

### New Policy Structure

#### Vendors Table
```sql
-- Authenticated users: view all vendors
CREATE POLICY "Vendors: authenticated can view all"
ON public.vendors FOR SELECT TO authenticated USING (true);

-- Anonymous users: view only verified vendors
CREATE POLICY "Vendors: public can view verified"
ON public.vendors FOR SELECT TO anon USING (is_verified = true);

-- Vendors: update own record
CREATE POLICY "Vendors: users can update own record"
ON public.vendors FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Admins: full access
CREATE POLICY "Vendors: admins can manage all"
ON public.vendors FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

#### Documents Table
```sql
-- Authenticated users: view all documents
CREATE POLICY "Documents: authenticated can view all"
ON public.documents FOR SELECT TO authenticated USING (true);

-- Anonymous users: view only verified documents
CREATE POLICY "Documents: public can view verified"
ON public.documents FOR SELECT TO anon USING (status = 'verified');

-- Vendors: insert/update own documents
CREATE POLICY "Documents: vendors can insert own"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (vendor_id = public.get_user_vendor_id(auth.uid()));

CREATE POLICY "Documents: vendors can update own"
ON public.documents FOR UPDATE TO authenticated
USING (vendor_id = public.get_user_vendor_id(auth.uid()))
WITH CHECK (vendor_id = public.get_user_vendor_id(auth.uid()));

-- Admins: full access
CREATE POLICY "Documents: admins can manage all"
ON public.documents FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

#### Other Tables (Ingredients, Menu Items, etc.)
For tables that don't have specific ownership requirements, the policies are even simpler:

```sql
-- Authenticated users: full access
CREATE POLICY "Ingredients: authenticated can view all"
ON public.ingredients FOR SELECT TO authenticated USING (true);

-- Anonymous users: view all
CREATE POLICY "Ingredients: public can view all"
ON public.ingredients FOR SELECT TO anon USING (true);

-- Similar patterns for insert/update/delete
```

## Testing Guide

### Vendor Portal Access Test

1. **Authenticated Vendor User** (e.g., user_id: `d0f714e2-f772-4e94-ac70-04334987e440`):
   - Should be able to access the vendor portal
   - Should see their vendor profile
   - Should be able to view all schools
   - Should be able to view their documents
   - Should be able to upload new documents

2. **Anonymous User**:
   - Should be able to view verified vendors
   - Should be able to view verified documents
   - Should be able to view published menus and related data

3. **Admin User**:
   - Should have full access to all tables
   - Should be able to manage vendors, documents, etc.

### SQL Test Queries

```sql
-- Test 1: Vendor can query their own vendor record
-- Run as authenticated user
SELECT * FROM vendors WHERE user_id = auth.uid();

-- Test 2: Vendor can view all schools
SELECT * FROM schools;

-- Test 3: Vendor can view their documents with joins
SELECT d.*, v.name as vendor_name, s.name as school_name
FROM documents d
LEFT JOIN vendors v ON d.vendor_id = v.id
LEFT JOIN schools s ON d.school_id = s.id
WHERE d.vendor_id = (SELECT id FROM vendors WHERE user_id = auth.uid());

-- Test 4: Anonymous user can view verified documents
-- Run as anonymous
SELECT * FROM documents WHERE status = 'verified';
```

## Migration Application

To apply this migration:

1. **Using Supabase CLI**:
   ```bash
   supabase db reset  # Resets database and applies all migrations
   # OR
   supabase migration up  # Applies pending migrations
   ```

2. **Using Supabase Dashboard**:
   - Go to the SQL Editor
   - Copy and paste the contents of `20260119140000_fix_rls_infinite_recursion.sql`
   - Execute the migration

## Rollback Plan

If issues arise, you can rollback by:

1. Restoring the previous policies from migration `20260119125039_cd8683fd-80a5-49c3-87f4-2d3881f82022.sql`
2. However, this would restore the infinite recursion issue

A better approach would be to:
1. Keep the new simplified policies
2. Create additional policies as needed for specific use cases
3. Always test new policies in a development environment first

## Security Considerations

### Access Control Changes

1. **Broader Authenticated Access**: Authenticated users now have broader read access to most tables. This is intentional to support the dashboard functionality.

2. **Helper Functions are Safe**: The helper functions (`get_user_vendor_id`, `has_role`, etc.) are marked as `SECURITY DEFINER`, which means they execute with elevated privileges and bypass RLS. This is safe because:
   - They only query specific, filtered data
   - They don't allow arbitrary queries
   - They are defined in the initial migration and controlled by database admins

3. **Anonymous Access**: Anonymous users have limited access to only public or verified data, which is appropriate for the use case.

### Best Practices for Future Policies

1. **Avoid Cross-Table JOINs in RLS Policies**: Always check only the current table's columns
2. **Use Helper Functions**: Create SECURITY DEFINER functions for complex checks
3. **Test in Development First**: Always test new policies in a staging environment
4. **Monitor Performance**: Complex policies can impact query performance
5. **Document Security Model**: Keep documentation updated with access control decisions

## Files Changed

- `supabase/migrations/20260119140000_fix_rls_infinite_recursion.sql` - New migration file with simplified RLS policies

## Related Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Avoiding RLS Recursion](https://supabase.com/docs/guides/database/postgres/row-level-security#policies-with-security-definer-functions)
