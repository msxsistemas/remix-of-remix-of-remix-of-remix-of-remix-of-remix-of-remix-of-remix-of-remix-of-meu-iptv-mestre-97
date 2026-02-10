import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

function mergeSetCookies(existing: string, setCookieHeader: string | null): string {
  if (!setCookieHeader) return existing;
  const parts = setCookieHeader.split(/,\s*(?=[A-Za-z_-]+=)/).map(c => c.split(';')[0].trim());
  const existingParts = existing ? existing.split('; ').filter(Boolean) : [];
  const cookieMap = new Map<string, string>();
  for (const c of existingParts) { const n = c.split('=')[0]; if (n) cookieMap.set(n, c); }
  for (const c of parts) { const n = c.split('=')[0]; if (n) cookieMap.set(n, c); }
  return [...cookieMap.values()].join('; ');
}

// KOffice API (Xtream-style) - uses GET with username/password params
async function xtreamRenew(baseUrl: string, panelUser: string, panelPass: string, clientUsername: string, duration: number, durationIn: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const apiPaths = ['/panel_api.php', '/api.php'];

  for (const path of apiPaths) {
    // Step 1: Search for client by username
    const searchUrl = `${cleanBase}${path}?username=${encodeURIComponent(panelUser)}&password=${encodeURIComponent(panelPass)}&action=user&sub=list`;
    try {
      console.log(`🔍 KOffice Xtream: Buscando clientes via ${path}`);
      const searchResp = await withTimeout(fetch(searchUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      }), 15000);
      const searchText = await searchResp.text();
      let searchJson: any = null;
      try { searchJson = JSON.parse(searchText); } catch {}

      if (!searchResp.ok || !searchJson) continue;

      // Find the user - the response might be an object with user IDs as keys or an array
      let clientId: string | null = null;
      if (typeof searchJson === 'object' && !Array.isArray(searchJson)) {
        for (const [id, user] of Object.entries(searchJson as Record<string, any>)) {
          if ((user.username || '').toLowerCase() === clientUsername.toLowerCase()) {
            clientId = id;
            break;
          }
        }
      } else if (Array.isArray(searchJson)) {
        const match = searchJson.find((u: any) => (u.username || '').toLowerCase() === clientUsername.toLowerCase());
        if (match) clientId = String(match.id || match.user_id);
      }

      if (!clientId) {
        console.log(`⚠️ KOffice Xtream: Usuário "${clientUsername}" não encontrado via ${path}`);
        continue;
      }

      console.log(`✅ KOffice: Cliente encontrado (ID: ${clientId})`);

      // Step 2: Extend the user
      // Convert duration to timestamp or use the panel's extend endpoint
      const extendUrl = `${cleanBase}${path}?username=${encodeURIComponent(panelUser)}&password=${encodeURIComponent(panelPass)}&action=user&sub=extend&user_id=${clientId}&duration=${duration}&duration_in=${durationIn}`;
      
      const extendResp = await withTimeout(fetch(extendUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      }), 15000);
      const extendText = await extendResp.text();
      let extendJson: any = null;
      try { extendJson = JSON.parse(extendText); } catch {}

      console.log(`📊 KOffice extend → status: ${extendResp.status}, response: ${extendText.slice(0, 300)}`);

      if (extendResp.ok && (extendJson?.result === true || extendJson?.success || extendJson?.result === 1)) {
        return { success: true, message: 'Cliente renovado com sucesso via Xtream API' };
      }

      // Try alternative extend format
      const altExtendUrl = `${cleanBase}${path}?username=${encodeURIComponent(panelUser)}&password=${encodeURIComponent(panelPass)}&action=edit_user&user_id=${clientId}&duration=${duration}&duration_in=${durationIn}`;
      const altResp = await withTimeout(fetch(altExtendUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      }), 15000);
      const altText = await altResp.text();
      let altJson: any = null;
      try { altJson = JSON.parse(altText); } catch {}

      if (altResp.ok && (altJson?.result === true || altJson?.success || altJson?.result === 1)) {
        return { success: true, message: 'Cliente renovado com sucesso via Xtream API' };
      }
    } catch (e) {
      console.log(`⚠️ KOffice Xtream ${path}: ${(e as Error).message}`);
    }
  }

  return { success: false, error: 'Não foi possível renovar via Xtream API' };
}

// KOffice V2 (form-based, similar to MundoGF)
async function kofficeV2Renew(baseUrl: string, panelUser: string, panelPass: string, clientUsername: string, duration: number, durationIn: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const cleanBase = baseUrl.replace(/\/$/, '');

  // Step 1: Login via form
  const loginResp = await withTimeout(fetch(`${cleanBase}/login`, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' },
  }), 10000);
  const loginHtml = await loginResp.text();

  const csrfInput = loginHtml.match(/name=["']_token["']\s+value=["'](.*?)["']/);
  const csrfMeta = loginHtml.match(/<meta\s+name=["']csrf-token["']\s+content=["'](.*?)["']/);
  const csrfMatch = loginHtml.match(/name=["']csrf_token["']\s+value=["'](.*?)["']/);
  const csrfToken = (csrfInput ? csrfInput[1] : null) || (csrfMeta ? csrfMeta[1] : null) || (csrfMatch ? csrfMatch[1] : null) || '';

  let allCookies = mergeSetCookies('', loginResp.headers.get('set-cookie'));

  const formBody = new URLSearchParams();
  formBody.append('try_login', '1');
  if (csrfToken) {
    formBody.append('_token', csrfToken);
    formBody.append('csrf_token', csrfToken);
  }
  formBody.append('username', panelUser);
  formBody.append('password', panelPass);

  const postHeaders: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
    'Origin': cleanBase,
    'Referer': `${cleanBase}/login`,
  };
  if (allCookies) postHeaders['Cookie'] = allCookies;
  const xsrfMatch = allCookies.match(/XSRF-TOKEN=([^;,\s]+)/);
  if (xsrfMatch) postHeaders['X-XSRF-TOKEN'] = decodeURIComponent(xsrfMatch[1]);

  const postResp = await withTimeout(fetch(`${cleanBase}/login`, {
    method: 'POST',
    headers: postHeaders,
    body: formBody.toString(),
    redirect: 'manual',
  }), 15000);

  allCookies = mergeSetCookies(allCookies, postResp.headers.get('set-cookie'));
  await postResp.text();

  const postLocation = postResp.headers.get('location') || '';
  const isSuccess = (postResp.status === 302 || postResp.status === 301) && postLocation && !postLocation.toLowerCase().includes('/login');
  if (!isSuccess) {
    return { success: false, error: `Login KOffice V2 falhou (status: ${postResp.status})` };
  }

  // Follow redirect
  const followUrl = postLocation.startsWith('http') ? postLocation : `${cleanBase}${postLocation}`;
  const followResp = await withTimeout(fetch(followUrl, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Cookie': allCookies },
    redirect: 'manual',
  }), 10000);
  allCookies = mergeSetCookies(allCookies, followResp.headers.get('set-cookie'));
  const dashHtml = await followResp.text();
  const dashCsrf = dashHtml.match(/<meta\s+name=["']csrf-token["']\s+content=["'](.*?)["']/);
  const freshCsrf = dashCsrf ? dashCsrf[1] : csrfToken;

  console.log(`✅ KOffice V2: Login OK, buscando cliente "${clientUsername}"`);

  // Step 2: Search for client - try multiple patterns
  const searchEndpoints = [
    { url: `${cleanBase}/ajax/getClients`, method: 'POST', isDataTable: true },
    { url: `${cleanBase}/api/clients?search=${encodeURIComponent(clientUsername)}`, method: 'GET', isDataTable: false },
    { url: `${cleanBase}/dashboard/api?get_users`, method: 'GET', isDataTable: false },
  ];

  let clientId: string | null = null;
  for (const ep of searchEndpoints) {
    try {
      const headers: Record<string, string> = {
        'Cookie': allCookies,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': `${cleanBase}/`,
      };

      let fetchOpts: any = { method: ep.method, headers };

      if (ep.isDataTable && ep.method === 'POST') {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        headers['X-CSRF-TOKEN'] = freshCsrf;
        const dtBody = new URLSearchParams();
        dtBody.append('draw', '1');
        dtBody.append('start', '0');
        dtBody.append('length', '1000');
        dtBody.append('search[value]', clientUsername);
        fetchOpts.body = dtBody.toString();
      }

      const resp = await withTimeout(fetch(ep.url, fetchOpts), 15000);
      const text = await resp.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}

      if (!resp.ok || !json) continue;

      // DataTable format
      if (json.data && Array.isArray(json.data)) {
        const match = json.data.find((c: any) => {
          const u = (c.username || '').replace(/<[^>]*>/g, '').trim().toLowerCase();
          return u === clientUsername.toLowerCase();
        });
        if (match) {
          clientId = String(match.user_id || match.id);
          console.log(`✅ KOffice V2: Cliente encontrado (ID: ${clientId})`);
          break;
        }
      }

      // Array or object format
      const items = json.users || json.clients || (Array.isArray(json) ? json : null);
      if (items) {
        const arr = Array.isArray(items) ? items : Object.values(items);
        const match = arr.find((c: any) => (c.username || '').toLowerCase() === clientUsername.toLowerCase());
        if (match) {
          clientId = String((match as any).user_id || (match as any).id);
          break;
        }
      }
    } catch (e) {
      console.log(`⚠️ KOffice V2 search ${ep.url}: ${(e as Error).message}`);
    }
  }

  if (!clientId) {
    return { success: false, error: `Usuário "${clientUsername}" não encontrado no painel KOffice V2` };
  }

  // Step 3: Extend client
  const extendEndpoints = [
    `${cleanBase}/clients/${clientId}/extend`,
    `${cleanBase}/api/clients/${clientId}/extend`,
    `${cleanBase}/dashboard/api?extend_user&user_id=${clientId}&duration=${duration}&duration_in=${durationIn}`,
  ];

  for (const url of extendEndpoints) {
    try {
      const isGet = url.includes('dashboard/api?');
      const extendBody = new URLSearchParams();
      if (!isGet) {
        extendBody.append('_token', freshCsrf);
        extendBody.append('duration', String(duration));
        extendBody.append('duration_in', durationIn);
      }

      const resp = await withTimeout(fetch(url, {
        method: isGet ? 'GET' : 'POST',
        headers: {
          'Cookie': allCookies,
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': freshCsrf,
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': `${cleanBase}/clients`,
        },
        body: isGet ? undefined : extendBody.toString(),
      }), 15000);

      const text = await resp.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}

      console.log(`📊 KOffice V2 extend ${url} → status: ${resp.status}, response: ${text.slice(0, 300)}`);

      if (resp.ok && (json?.success || json?.result === true || json?.message)) {
        return { success: true, message: json?.message || 'Cliente renovado com sucesso no KOffice V2' };
      }
    } catch (e) {
      console.log(`⚠️ KOffice V2 extend: ${(e as Error).message}`);
    }
  }

  return { success: false, error: 'Não foi possível renovar no KOffice V2. Endpoints de extensão não responderam.' };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, panelId, username, duration, durationIn } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Support both koffice-api and koffice-v2
    const { data: panel } = await supabase
      .from('paineis_integracao')
      .select('*')
      .eq('id', panelId)
      .in('provedor', ['koffice-api', 'koffice-v2'])
      .single();

    if (!panel) {
      return new Response(JSON.stringify({ success: false, error: 'Painel KOffice não encontrado' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    if (action === 'renew_by_username') {
      if (!username || !duration || !durationIn) {
        return new Response(JSON.stringify({ success: false, error: 'username, duration e durationIn são obrigatórios' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
        });
      }

      console.log(`🔄 KOffice (${panel.provedor}): Renovando "${username}" no painel ${panel.nome}`);

      let result;
      if (panel.provedor === 'koffice-api') {
        result = await xtreamRenew(panel.url, panel.usuario, panel.senha, username, Number(duration), durationIn);
      } else {
        result = await kofficeV2Renew(panel.url, panel.usuario, panel.senha, username, Number(duration), durationIn);
      }

      if (result.success) {
        // Log renewal
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
          const { data: { user } } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
          if (user?.id) {
            await supabase.from('logs_painel').insert({
              user_id: user.id,
              acao: `Renovação KOffice: cliente ${username} → +${duration} ${durationIn} (Painel: ${panel.nome})`,
              tipo: 'renovacao',
            });
          }
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Action inválida. Use: renew_by_username' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  } catch (error) {
    console.error(`❌ Erro: ${(error as Error).message}`);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
