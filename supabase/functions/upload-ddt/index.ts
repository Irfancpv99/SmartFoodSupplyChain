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

    const userId = claimsData.claims.sub as string;

    // Get vendor for user
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: vendor } = await serviceClient
      .from('vendors')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!vendor) {
      return new Response(
        JSON.stringify({ error: 'User is not a registered vendor' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { schoolId, deliveryDate, filePath, fileName, fileType, fileSize, fileHash, products } = await req.json();

    if (!schoolId || !filePath || !fileName || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate DDT number
    const { data: ddtResult } = await serviceClient.rpc('generate_ddt_number');
    const ddtNumber = ddtResult || `DDT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Create document record
    const { data: document, error: docError } = await serviceClient
      .from('documents')
      .insert({
        ddt_number: ddtNumber,
        vendor_id: vendor.id,
        school_id: schoolId,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        file_hash: fileHash,
        delivery_date: deliveryDate,
        status: 'pending',
        metadata: { products },
      })
      .select()
      .single();

    if (docError) {
      console.error('Document creation error:', docError);
      throw docError;
    }

    // Create ingredient records if products provided
    if (products && Array.isArray(products)) {
      for (const product of products) {
        await serviceClient
          .from('ingredients')
          .insert({
            document_id: document.id,
            name: product.name,
            quantity: parseFloat(product.quantity) || null,
            unit: product.unit,
            lot_number: product.lotNumber,
            origin: product.origin,
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        document: {
          id: document.id,
          ddtNumber: document.ddt_number,
          status: document.status,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('DDT upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process DDT upload' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
