-- Fix function search path for generate_ddt_number
CREATE OR REPLACE FUNCTION public.generate_ddt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    year_part TEXT;
    seq_part TEXT;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_part := LPAD(nextval('public.ddt_number_seq')::TEXT, 6, '0');
    RETURN 'DDT-' || year_part || '-' || seq_part;
END;
$$;

-- Fix overly permissive blockchain records insert policy
DROP POLICY IF EXISTS "Only system can insert blockchain records" ON public.blockchain_records;

CREATE POLICY "Authenticated users can insert blockchain records for their entities"
    ON public.blockchain_records FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Vendors can create records for their documents
        (reference_table = 'documents' AND reference_id IN (
            SELECT id FROM public.documents WHERE vendor_id = public.get_user_vendor_id(auth.uid())
        ))
        OR
        -- School admins can create records for their menus
        (reference_table = 'menus' AND reference_id IN (
            SELECT id FROM public.menus WHERE school_id = public.get_user_school_id(auth.uid())
        ))
        OR
        -- Admins can create any records
        public.has_role(auth.uid(), 'admin')
    );