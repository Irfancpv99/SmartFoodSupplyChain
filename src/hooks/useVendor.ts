import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Vendor {
  id: string;
  name: string;
  business_name: string | null;
  vat_number: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  user_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_verified: boolean;
  certifications: string[] | null;
}

export function useCurrentVendor() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Vendor | null;
    },
    enabled: !!user?.id,
  });
}

export function useSchools() {
  return useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}
