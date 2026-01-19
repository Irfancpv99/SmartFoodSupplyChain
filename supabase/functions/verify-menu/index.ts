import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for public access - this function is publicly accessible
    // and uses service role to query data, returning only safe public fields
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { menuId } = await req.json();

    if (!menuId) {
      return new Response(
        JSON.stringify({ error: 'Menu ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch menu with all related data
    const { data: menu, error: menuError } = await supabaseClient
      .from('menus')
      .select(`
        *,
        schools(name, city, address),
        menu_items(
          *,
          menu_item_ingredients(
            *,
            ingredients(
              *,
              documents(
                id,
                ddt_number,
                file_hash,
                delivery_date,
                status,
                blockchain_tx_id,
                vendors(name, business_name)
              )
            )
          )
        )
      `)
      .or(`id.eq.${menuId},menu_id.eq.${menuId}`)
      .maybeSingle();

    if (menuError || !menu) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Menu not found',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch blockchain record for the menu
    const { data: blockchainRecord } = await supabaseClient
      .from('blockchain_records')
      .select('*')
      .eq('reference_id', menu.id)
      .eq('reference_table', 'menus')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Collect all linked documents
    const documents: any[] = [];
    const documentIds = new Set<string>();

    menu.menu_items?.forEach((item: any) => {
      item.menu_item_ingredients?.forEach((mii: any) => {
        if (mii.ingredients?.documents && !documentIds.has(mii.ingredients.documents.id)) {
          documentIds.add(mii.ingredients.documents.id);
          documents.push(mii.ingredients.documents);
        }
      });
    });

    // Build verification response
    const verificationResult = {
      verified: menu.is_published,
      menu: {
        id: menu.id,
        menuId: menu.menu_id,
        name: menu.name,
        date: menu.date,
        mealType: menu.meal_type,
        school: menu.schools,
        items: menu.menu_items?.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          allergens: item.allergens,
          ingredients: item.menu_item_ingredients?.map((mii: any) => ({
            id: mii.ingredient_id,
            name: mii.ingredients?.name,
            origin: mii.ingredients?.origin,
            quantity: mii.quantity,
            unit: mii.unit,
            document: mii.ingredients?.documents ? {
              id: mii.ingredients.documents.id,
              ddtNumber: mii.ingredients.documents.ddt_number,
              status: mii.ingredients.documents.status,
              vendor: mii.ingredients.documents.vendors,
            } : null,
          })) || [],
        })) || [],
      },
      documents: documents.map(doc => ({
        id: doc.id,
        ddtNumber: doc.ddt_number,
        deliveryDate: doc.delivery_date,
        status: doc.status,
        hash: doc.file_hash,
        blockchainTxId: doc.blockchain_tx_id,
        vendor: doc.vendors,
      })),
      verification: {
        privateChain: !!blockchainRecord,
        publicChain: !!blockchainRecord?.tx_id,
        menuHash: blockchainRecord?.data_hash,
        lastVerified: new Date().toISOString(),
        blockchainRecord: blockchainRecord ? {
          txId: blockchainRecord.tx_id,
          blockNumber: blockchainRecord.block_number,
          timestamp: blockchainRecord.timestamp,
        } : null,
      },
    };

    return new Response(
      JSON.stringify(verificationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Menu verification error:', error);
    return new Response(
      JSON.stringify({ verified: false, error: 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
