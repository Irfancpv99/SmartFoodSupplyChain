# Deployment Guide - RLS Infinite Recursion Fix

## Quick Summary

This fix resolves the infinite recursion issue in Row Level Security (RLS) policies that was causing 500 errors and making the vendor portal inaccessible.

## What Was Changed

**File Created:**
- `supabase/migrations/20260119140000_fix_rls_infinite_recursion.sql` - New migration with simplified RLS policies

**Documentation Added:**
- `RLS_FIX_DOCUMENTATION.md` - Comprehensive documentation of the problem, solution, and testing guide

## Deployment Steps

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Ensure you have the latest Supabase CLI
npm install -g supabase

# 2. Link to your project (if not already linked)
supabase link --project-ref webvmszanenmgcsqhhta

# 3. Apply the migration
supabase db push

# 4. Verify the migration was applied
supabase db diff
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/webvmszanenmgcsqhhta
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20260119140000_fix_rls_infinite_recursion.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 3: Using Database Reset (Development Only)

```bash
# WARNING: This will delete all data
supabase db reset
```

## Verification Steps

After deployment, verify the fix works:

### 1. Test Vendor Portal Access

1. Log in as a vendor user (e.g., user_id: `d0f714e2-f772-4e94-ac70-04334987e440`)
2. Navigate to the vendor portal at `/vendor-portal`
3. Verify the page loads without 500 errors
4. Check that:
   - Vendor profile information displays
   - Schools list loads
   - Document history shows correctly

### 2. Test Database Queries

Run these queries in the SQL Editor to verify policies work:

```sql
-- Should return results without errors
SELECT * FROM vendors WHERE user_id = auth.uid();

-- Should return all schools
SELECT * FROM schools;

-- Should return documents with joins (this was failing before)
SELECT d.*, v.name as vendor_name, s.name as school_name
FROM documents d
LEFT JOIN vendors v ON d.vendor_id = v.id
LEFT JOIN schools s ON d.school_id = s.id;
```

### 3. Test Anonymous Access

Open an incognito window and verify:
- You can view verified vendors
- You can view verified documents
- You can view published menus

## Expected Results

✅ **Before the fix:**
- Vendor portal showed 500 errors
- Database queries with JOINs caused infinite recursion
- RLS policies created circular dependencies

✅ **After the fix:**
- Vendor portal loads successfully
- All database queries complete without errors
- RLS policies are simplified and efficient
- Security model is maintained

## Rollback Plan

If you need to rollback (not recommended):

1. The previous migration (`20260119125039_cd8683fd-80a5-49c3-87f4-2d3881f82022.sql`) contained the problematic policies
2. Reverting would restore the infinite recursion issue
3. Instead, if issues arise, create a new migration to adjust specific policies

## Monitoring

After deployment, monitor:

1. **Error Logs**: Check for any 500 errors in vendor portal
2. **Query Performance**: Monitor database query times
3. **User Reports**: Check if vendors can access their portal

## Support

If you encounter issues:

1. Check the `RLS_FIX_DOCUMENTATION.md` for troubleshooting
2. Verify the migration was applied: 
   ```sql
   SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;
   ```
3. Review Supabase logs in the dashboard

## Security Notes

- ✅ Access model is intentionally broad for authenticated users (matches original design)
- ✅ Anonymous users have restricted access to verified/published data only
- ✅ Helper functions use SECURITY DEFINER safely
- ✅ No SQL injection vulnerabilities
- ✅ Code review and security scan completed

## Timeline

- **Issue Reported**: Vendor portal inaccessible due to 500 errors
- **Root Cause**: Circular dependencies in RLS policies
- **Fix Created**: Simplified RLS policies migration
- **Testing**: Verified policies work correctly
- **Documentation**: Comprehensive guide created
- **Ready for Deployment**: Yes ✅

## Questions?

Refer to:
- `RLS_FIX_DOCUMENTATION.md` - Detailed technical documentation
- `supabase/migrations/20260119140000_fix_rls_infinite_recursion.sql` - The migration file
- Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security
