import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId, fileHash } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: 'Document ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch document from database
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*, vendors(name, business_name), schools(name)')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Document not found',
          status: 'not_found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify hash if provided
    let hashVerified = true;
    if (fileHash && document.file_hash) {
      hashVerified = fileHash === document.file_hash;
    }

    // Check blockchain record
    const { data: blockchainRecord } = await supabaseClient
      .from('blockchain_records')
      .select('*')
      .eq('reference_id', documentId)
      .eq('reference_table', 'documents')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const verificationResult = {
      verified: document.status === 'verified' && hashVerified,
      document: {
        id: document.id,
        ddtNumber: document.ddt_number,
        status: document.status,
        uploadDate: document.upload_date,
        deliveryDate: document.delivery_date,
        verifiedAt: document.verified_at,
        vendor: document.vendors,
        school: document.schools,
      },
      hashVerified,
      blockchain: blockchainRecord ? {
        anchored: blockchainRecord.status === 'confirmed',
        txId: blockchainRecord.tx_id,
        blockNumber: blockchainRecord.block_number,
        timestamp: blockchainRecord.timestamp,
        dataHash: blockchainRecord.data_hash,
      } : null,
      verifiedAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(verificationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ verified: false, error: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
