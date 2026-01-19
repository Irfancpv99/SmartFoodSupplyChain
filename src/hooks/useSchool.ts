import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface School {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  admin_user_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  student_count: number;
}

export function useCurrentSchool() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['school', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('admin_user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as School | null;
    },
    enabled: !!user?.id,
  });
}

export function useIngredients(schoolId?: string) {
  return useQuery({
    queryKey: ['ingredients', schoolId],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select(`
          *,
          documents!inner(
            id,
            ddt_number,
            status,
            school_id,
            vendors(name, business_name)
          )
        `)
        .eq('documents.status', 'verified');

      if (schoolId) {
        query = query.eq('documents.school_id', schoolId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!schoolId,
  });
}
