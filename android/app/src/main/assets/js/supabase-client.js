// ============================================================
// AgroSmartHub 3.0 — Browser-side Supabase Client
// ============================================================
// Uses the ANON/PUBLIC key — safe to expose in frontend code.
// Service Role key must NEVER be used in the browser.
//
// This script fetches the Supabase URL and anon key from the
// backend's /api/supabase-config endpoint, then creates the
// client. If the backend is down, it falls back to values
// baked in at build time (see FALLBACK_ constants below).
// ============================================================

(function() {
  'use strict';

  // ── Fallback values (filled from your .env, safe to commit) ─
  // Replace these with your actual values from Supabase Dashboard:
  // Settings → API → Project URL + anon/public key
  const FALLBACK_URL     = 'https://mekkljheshjekexwpnso.supabase.co';
  const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1la2tsamhlc2hqZWtleHdwbnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzkwMDYsImV4cCI6MjA5OTE1NTAwNn0.Get9ubjdWljwue76eKSZrK5PTJO5LJ_zH_H7EBrdxC8'; // paste your anon key (eyJ...) here

  /**
   * Initialize the Supabase browser client.
   * Sets window.supabaseClient for use by auth.js, iot.js, etc.
   */
  async function initSupabaseClient() {
    let supabaseUrl  = FALLBACK_URL;
    let supabaseAnon = FALLBACK_ANON_KEY;

    // Try to fetch config from backend (non-blocking)
    try {
      const backendUrl = window.location.protocol === 'file:' ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}:5000`;
      const res = await fetch(`${backendUrl}/api/supabase-config`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const cfg = await res.json();
        if (cfg.url)            supabaseUrl  = cfg.url;
        // Note: backend only confirms validity, anon key comes from FALLBACK
        // (the backend doesn't expose the key for security — you set it above)
      }
    } catch (_) {
      // Backend not running — use fallback values (still works for direct Supabase auth)
    }

    // Check if supabase-js is loaded (via CDN script tag)
    if (typeof window.supabase === 'undefined') {
      console.error('❌ supabase-js library not loaded. Add the CDN script tag before supabase-client.js');
      return;
    }

    if (!supabaseAnon || !supabaseAnon.startsWith('eyJ')) {
      console.warn('⚠️  supabase-client.js: FALLBACK_ANON_KEY is not set.');
      console.warn('   Direct browser → Supabase login will not work.');
      console.warn('   Open js/supabase-client.js and paste your anon key on line 20.');
      window.supabaseClient = null;
      return;
    }

    try {
      window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnon, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          storageKey: 'ash_supabase_session',
        },
        realtime: {
          params: { eventsPerSecond: 10 }
        }
      });

      console.log('✅ Supabase browser client initialized:', supabaseUrl);

      // Listen for auth state changes (Google OAuth, Email Sign-in, Password Recovery)
      window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          if (typeof showResetPasswordForm === 'function') {
            showResetPasswordForm();
          }
        } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
          localStorage.setItem('ash_token', session.access_token);
          const u = session.user;
          const meta = u.user_metadata || {};
          const name = meta.full_name || meta.name || (u.email ? u.email.split('@')[0] : 'Google User');
          const role = meta.role || 'farmer';
          
          // Auto-sync Google / OAuth user profile to Supabase database
          try {
            const { error: upsertErr } = await window.supabaseClient.from('users').upsert([{
              id: u.id,
              email: u.email,
              name: name,
              role: role,
              is_active: true
            }], { onConflict: 'id' });

            if (!upsertErr) {
              console.log('✅ Google/Supabase user profile synced to database:', u.email);
            }
          } catch (syncErr) {
            console.warn('Database profile sync notice:', syncErr.message);
          }

          const formattedUser = {
            id: u.id,
            email: u.email || '',
            name: name,
            role: role,
            mobile: meta.mobile || '',
            state: meta.state || '',
            avatar: meta.avatar_url || name.substring(0, 2).toUpperCase(),
            verified: true
          };

          if (typeof Session !== 'undefined') Session.set('user', formattedUser);
          else localStorage.setItem('ash_user', JSON.stringify(formattedUser));
        }
      });

      // Restore existing session if present
      const { data: { session } } = await window.supabaseClient.auth.getSession();
      if (session) {
        localStorage.setItem('ash_token', session.access_token);
        console.log('✅ Supabase session active for:', session.user.email);
      }

    } catch (err) {
      console.error('❌ Failed to initialize Supabase client:', err.message);
      window.supabaseClient = null;
    }
  }

  // Initialize immediately
  window.supabaseClientReady = initSupabaseClient();

})();
