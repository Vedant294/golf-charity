// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { winner_id, new_status } = await req.json()
    
    if (!['approved', 'paid'].includes(new_status)) {
      throw new Error("Invalid status update");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: winner, error } = await supabase
      .from('winners')
      .update({ status: new_status })
      .eq('id', winner_id)
      .select()
      .single()

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, winner }), { headers: { "Content-Type": "application/json" } })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 400 })
  }
})

