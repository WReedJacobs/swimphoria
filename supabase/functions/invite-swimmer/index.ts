import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the caller is an authenticated coach — never trust a client-supplied coach id
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { swimmerId, redirectTo } = await req.json()
    if (!swimmerId || typeof swimmerId !== 'string') {
      return new Response(JSON.stringify({ error: 'swimmerId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!redirectTo || typeof redirectTo !== 'string') {
      return new Response(JSON.stringify({ error: 'redirectTo required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: swimmer, error: swimmerErr } = await adminClient
      .from('swimmers')
      .select('id, coach_id, invite_email, display_name, profile_id')
      .eq('id', swimmerId)
      .single()

    if (swimmerErr || !swimmer) {
      return new Response(JSON.stringify({ error: 'Swimmer not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (swimmer.coach_id !== caller.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!swimmer.invite_email) {
      return new Response(JSON.stringify({ error: 'No email on file for this swimmer' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (swimmer.profile_id) {
      return new Response(JSON.stringify({ error: 'This swimmer already has a linked account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // invited_swimmer_id rides in user metadata so handle_new_user (see
    // 023_swimmer_invite.sql) can link this swimmer row and set role='swimmer'
    // the moment the auth user is created — no separate linking step needed.
    const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
      swimmer.invite_email,
      {
        data: {
          full_name: swimmer.display_name,
          invited_swimmer_id: swimmer.id,
        },
        redirectTo,
      },
    )
    if (inviteErr) {
      return new Response(JSON.stringify({ error: inviteErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await adminClient
      .from('swimmers')
      .update({ invited_at: new Date().toISOString() })
      .eq('id', swimmerId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
