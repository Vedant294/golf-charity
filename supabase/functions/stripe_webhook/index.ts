// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');

  try {
    const body = await req.text();
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.client_reference_id;
      const planType = session.metadata?.plan_type || 'monthly';

      if (userId) {
        const subStart = new Date();
        const subEnd = new Date();
        if (planType === 'yearly') {
          subEnd.setFullYear(subEnd.getFullYear() + 1);
        } else {
          subEnd.setMonth(subEnd.getMonth() + 1);
        }

        await supabase.from('users').update({
          is_subscribed: true,
          plan_type: planType,
          subscription_start: subStart.toISOString(),
          subscription_end: subEnd.toISOString(),
        }).eq('id', userId);

        await supabase.from('transactions').insert({
          user_id: userId,
          amount: session.amount_total / 100,
          plan_type: planType,
          status: 'success',
        });

        // Add 50% of payment to prize pool
        const poolIncrement = (session.amount_total / 100) * 0.5;
        const { data: cfg } = await supabase.from('system_config').select('rollover_pool').limit(1).single();
        if (cfg) {
          await supabase.from('system_config').update({
            rollover_pool: Number(cfg.rollover_pool) + poolIncrement,
          }).eq('id', 1);
        }

        // Send welcome email
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        const email = authUser?.user?.email;
        if (email) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
          await fetch(`${supabaseUrl}/functions/v1/send_email_notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceKey}` },
            body: JSON.stringify({
              to: email,
              subject: 'â›³ Welcome to Golf Charity â€” You\'re In!',
              html: `<h2>Welcome to the Club!</h2><p>Your <strong>${planType}</strong> subscription is now active. Start submitting your Stableford scores and compete in the next monthly draw.</p>`,
            }),
          });
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      // Find user by stripe customer ID via transactions or metadata
      const customerId = subscription.customer;
      // Mark user as unsubscribed â€” requires customer_id stored on user
      // For now update via metadata if available
      const userId = subscription.metadata?.user_id;
      if (userId) {
        await supabase.from('users').update({ is_subscribed: false }).eq('id', userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});

