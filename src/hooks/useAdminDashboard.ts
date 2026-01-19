import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  totalSchools: number;
  totalVendors: number;
  totalDocuments: number;
  totalMenus: number;
  pendingVerifications: number;
  verifiedToday: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: schoolsCount },
        { count: vendorsCount },
        { count: documentsCount },
        { count: menusCount },
        { count: pendingCount },
        { count: verifiedTodayCount },
      ] = await Promise.all([
        supabase.from('schools').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('menus').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('documents').select('*', { count: 'exact', head: true })
          .eq('status', 'verified')
          .gte('verified_at', today.toISOString()),
      ]);

      return {
        totalSchools: schoolsCount || 0,
        totalVendors: vendorsCount || 0,
        totalDocuments: documentsCount || 0,
        totalMenus: menusCount || 0,
        pendingVerifications: pendingCount || 0,
        verifiedToday: verifiedTodayCount || 0,
      } as DashboardStats;
    },
  });
}

export function useRecentDocuments(limit = 5) {
  return useQuery({
    queryKey: ['recent-documents', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          ddt_number,
          upload_date,
          status,
          vendors(name, business_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useRecentBlockchainRecords(limit = 5) {
  return useQuery({
    queryKey: ['recent-blockchain', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blockchain_records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useAllSchools() {
  return useQuery({
    queryKey: ['all-schools'],
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

export function useAllVendors() {
  return useQuery({
    queryKey: ['all-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
}
