import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Document {
  id: string;
  ddt_number: string;
  vendor_id: string;
  school_id: string | null;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  file_hash: string | null;
  upload_date: string;
  delivery_date: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  verified_at: string | null;
  blockchain_tx_id: string | null;
  metadata: Record<string, any>;
  vendors?: { name: string; business_name: string | null };
  schools?: { name: string };
}

export function useDocuments(vendorId?: string, schoolId?: string) {
  return useQuery({
    queryKey: ['documents', vendorId, schoolId],
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select(`
          *,
          vendors(name, business_name),
          schools(name)
        `)
        .order('created_at', { ascending: false });

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      schoolId,
      deliveryDate,
      products,
    }: {
      file: File;
      schoolId: string;
      deliveryDate: string;
      products: Array<{ name: string; quantity: string; unit: string; lotNumber: string }>;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const userId = session.user.id;
      
      // Read file and generate hash
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Upload file to storage
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('ddt-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Call edge function to create document record
      const { data, error } = await supabase.functions.invoke('upload-ddt', {
        body: {
          schoolId,
          deliveryDate,
          filePath,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileHash,
          products,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document uploaded successfully!');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    },
  });
}

export function useVerifyDocument() {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data, error } = await supabase.functions.invoke('verify-document', {
        body: { documentId },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useAnchorToBlockchain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referenceId,
      referenceTable,
      data,
    }: {
      referenceId: string;
      referenceTable: string;
      data: Record<string, any>;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('anchor-blockchain', {
        body: { referenceId, referenceTable, data },
      });
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['blockchain-records'] });
      toast.success('Successfully anchored to blockchain!');
    },
    onError: (error) => {
      console.error('Blockchain anchor error:', error);
      toast.error('Failed to anchor to blockchain');
    },
  });
}
