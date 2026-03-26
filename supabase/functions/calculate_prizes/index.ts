// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get System Config and Active User Count
    const { data: config } = await supabase.from('system_config').select('*').eq('id', 1).single();
    const { count: activeUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_subscribed', true);
    
    if (!config || activeUsers === null) throw new Error("Config or users not found");

    // 2. Calculate Total Pool
    const subAmount: number = config.subscription_amount;
    const rollover: number = config.rollover_pool;
    
    // The total prize pool is drawn actively from the accrued rollover_pool 
    // populated by the stripe_webhook all month long.
    const totalPrizePool = rollover;

    // Distribution
    const pool5 = totalPrizePool * 0.40;
    const pool4 = totalPrizePool * 0.35;
    const pool3 = totalPrizePool * 0.25;

    // 3. Find Winners from latest draw
    const { data: latestDraw } = await supabase.from('draws').select('id').order('created_at', { ascending: false }).limit(1).single();
    
    if (latestDraw) {
      const { data: winners } = await supabase.from('winners').select('*').eq('draw_id', latestDraw.id);
      
      let w5 = winners?.filter(w => w.match_count === 5) || [];
      let w4 = winners?.filter(w => w.match_count === 4) || [];
      let w3 = winners?.filter(w => w.match_count === 3) || [];

      let newRollover = 0;

      // Update 5 matches
      if (w5.length > 0) {
        const prize = pool5 / w5.length;
        for (const w of w5) {
          await supabase.from('winners').update({ prize_amount: prize }).eq('id', w.id);
        }
      } else {
        newRollover += pool5; // Rollover if no 5 matches
      }

      // Update 4 matches
      if (w4.length > 0) {
        const prize = pool4 / w4.length;
        for (const w of w4) {
          await supabase.from('winners').update({ prize_amount: prize }).eq('id', w.id);
        }
      } 
      // PRD: 4-Match does NOT rollover

      // Update 3 matches
      if (w3.length > 0) {
        const prize = pool3 / w3.length;
        for (const w of w3) {
          await supabase.from('winners').update({ prize_amount: prize }).eq('id', w.id);
        }
      }
      // PRD: 3-Match does NOT rollover

      // Update rollover in config
      await supabase.from('system_config').update({ rollover_pool: newRollover }).eq('id', 1);
    }

    return new Response(JSON.stringify({ success: true, totalPrizePool }), { headers: { "Content-Type": "application/json" } })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})

