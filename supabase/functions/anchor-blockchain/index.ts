import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated blockchain anchoring - in production, this would connect to a real blockchain
async function simulateBlockchainAnchor(dataHash: string): Promise<{
  txId: string;
  blockNumber: number;
  timestamp: string;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock transaction ID (would be real in production)
  const txId = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('')}`;
  
  // Mock block number
  const blockNumber = Math.floor(Math.random() * 1000000) + 18000000;
  
  return {
    txId,
    blockNumber,
    timestamp: new Date().toISOString(),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const { referenceId, referenceTable, data } = await req.json();

    if (!referenceId || !referenceTable || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate hash of the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const dataHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    // Get previous hash for chain continuity
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: lastRecord } = await serviceClient
      .from('blockchain_records')
      .select('data_hash')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Simulate blockchain anchoring
    const blockchainResult = await simulateBlockchainAnchor(dataHash);

    // Create blockchain record
    const { data: newRecord, error: insertError } = await serviceClient
      .from('blockchain_records')
      .insert({
        record_type: referenceTable === 'documents' ? 'document' : 'menu',
        reference_id: referenceId,
        reference_table: referenceTable,
        data_hash: dataHash,
        previous_hash: lastRecord?.data_hash || null,
        tx_id: blockchainResult.txId,
        block_number: blockchainResult.blockNumber,
        timestamp: blockchainResult.timestamp,
        status: 'confirmed',
        metadata: {
          anchored_by: userId,
          original_data_summary: typeof data === 'object' ? Object.keys(data) : 'raw',
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Update the source record with blockchain info
    if (referenceTable === 'documents') {
      await serviceClient
        .from('documents')
        .update({
          blockchain_tx_id: blockchainResult.txId,
          blockchain_anchored_at: blockchainResult.timestamp,
        })
        .eq('id', referenceId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        record: newRecord,
        blockchain: blockchainResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Blockchain anchoring error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to anchor to blockchain' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
