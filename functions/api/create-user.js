// Cloudflare Pages Function para crear usuarios
// Esta función se ejecuta en el edge de Cloudflare

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get request body
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validate input
    if (!email || !password || !name || !role) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Supabase credentials from environment
    const SUPABASE_URL = env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    const SUPABASE_ANON_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Service role key no configurado' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify user is authenticated and has admin role
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const user = await userResponse.json();

    // Check if user has admin role
    const roleResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${user.id}&select=role`,
      {
        headers: {
          'Authorization': authHeader,
          'apikey': SUPABASE_ANON_KEY,
        },
      }
    );

    const roles = await roleResponse.json();
    if (!roles || roles.length === 0 || roles[0].role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para crear usuarios' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create user using admin API
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      }),
    });

    if (!createUserResponse.ok) {
      const error = await createUserResponse.text();
      return new Response(
        JSON.stringify({ error: `Error al crear usuario: ${error}` }),
        {
          status: createUserResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authData = await createUserResponse.json();
    const userId = authData.id;

    // Wait for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        name,
        active: true,
      }),
    });

    // First, delete any existing roles for this user (in case trigger created one)
    await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    // Then insert the correct role
    const roleInsertResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        role,
      }),
    });

    if (!roleInsertResponse.ok) {
      const error = await roleInsertResponse.text();
      return new Response(
        JSON.stringify({ error: `Error al asignar rol: ${error}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: authData.email,
          name,
          role,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}
