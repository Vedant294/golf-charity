// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: config } = await supabase.from('system_config').select('draw_type').single();
    const drawType = config?.draw_type || 'random';

    // Prevent duplicate draw in same month/year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const { data: existingDraw } = await supabase
      .from('draws').select('id').eq('month', month).eq('year', year).maybeSingle();

    if (existingDraw) {
      return new Response(JSON.stringify({ error: 'Draw already run for this month.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      });
    }

    // Generate 5 unique numbers 1-45
    const drawNumbers = new Set<number>();
    if (drawType === 'algorithmic') {
      while (drawNumbers.size < 5) {
        const base = Math.floor(Math.random() * 15) + 25;
        const rand = Math.random() > 0.5 ? base : Math.floor(Math.random() * 45) + 1;
        if (rand >= 1 && rand <= 45) drawNumbers.add(rand);
      }
    } else {
      while (drawNumbers.size < 5) drawNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const numbersArray = Array.from(drawNumbers);

    // Create Draw Record
    const { data: draw, error: drawError } = await supabase
      .from('draws').insert({ numbers: numbersArray, month, year }).select().single();
    if (drawError) throw drawError;

    // Update last_draw_date
    await supabase.from('system_config').update({ last_draw_date: now.toISOString() }).eq('id', 1);

    // Match subscribed users' scores
    const { data: users } = await supabase.from('users').select('id').eq('is_subscribed', true);
    const winnersList: any[] = [];

    if (users) {
      for (const u of users) {
        const { data: scores } = await supabase
          .from('scores').select('score').eq('user_id', u.id)
          .order('score_date', { ascending: false }).limit(5);

        if (scores && scores.length > 0) {
          const userScores = scores.map(s => s.score);
          const uniqueUserScores = new Set(userScores);
          let matchCount = 0;
          uniqueUserScores.forEach(s => {
            if (numbersArray.includes(s)) matchCount++;
          });
          if (matchCount >= 3) {
            winnersList.push({ user_id: u.id, draw_id: draw.id, match_count: matchCount, status: 'pending' });
          }
        }
      }
    }

    if (winnersList.length > 0) {
      await supabase.from('winners').insert(winnersList);
    }

    // Auto-calculate prizes
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    await fetch(`${supabaseUrl}/functions/v1/calculate_prizes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
    });

    // Email winners
    for (const winner of winnersList) {
      const { data: authUser } = await supabase.auth.admin.getUserById(winner.user_id);
      const email = authUser?.user?.email;
      if (email) {
        await fetch(`${supabaseUrl}/functions/v1/send_email_notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
          body: JSON.stringify({
            to: email,
            subject: 'ðŸ† You Won the Golf Charity Draw!',
            html: `<h2>Congratulations!</h2><p>You matched <strong>${winner.match_count} numbers</strong> in this month's draw!</p><p>Log in to your dashboard to upload your proof and claim your prize.</p>`,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ draw, winners_found: winnersList.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
})

