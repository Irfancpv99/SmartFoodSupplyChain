import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PendingDocument {
  id: string;
  ddt_number: string;
  file_name: string;
  file_path: string;
  upload_date: string;
  delivery_date: string | null;
  vendor: {
    name: string;
    business_name: string | null;
  } | null;
  school: {
    name: string;
  } | null;
}

export function usePendingDocuments() {
  const queryClient = useQueryClient();

  // Set up realtime subscription for documents
  useEffect(() => {
    const channel = supabase
      .channel('documents-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['pending-documents'] });
          queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['pending-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          ddt_number,
          file_name,
          file_path,
          upload_date,
          delivery_date,
          vendors(name, business_name),
          schools(name)
        `)
        .eq('status', 'pending')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      
      return data.map(doc => ({
        id: doc.id,
        ddt_number: doc.ddt_number,
        file_name: doc.file_name,
        file_path: doc.file_path,
        upload_date: doc.upload_date,
        delivery_date: doc.delivery_date,
        vendor: doc.vendors,
        school: doc.schools,
      })) as PendingDocument[];
    },
  });
}

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-documents'] });
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Document approved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to approve document: ${error.message}`);
    },
  });
}

export function useRejectDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: string; reason: string }) => {
      const { error } = await supabase
        .from('documents')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-documents'] });
      queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Document rejected');
    },
    onError: (error) => {
      toast.error(`Failed to reject document: ${error.message}`);
    },
  });
}
