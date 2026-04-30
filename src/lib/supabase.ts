/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Simplified env lookup using build-time constants
const getRawURL = (): string => {
  // @ts-expect-error - Defined at build time
  if (typeof __SUPABASE_URL__ !== 'undefined' && __SUPABASE_URL__) return __SUPABASE_URL__;
  return (import.meta as any).env?.VITE_SUPABASE_URL || '';
};

const getRawKey = (): string => {
  // @ts-expect-error - Defined at build time
  if (typeof __SUPABASE_ANON_KEY !== 'undefined' && __SUPABASE_ANON_KEY) return __SUPABASE_ANON_KEY;
  return (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON || '';
};

// Sanitize URL: Remove trailing slash and any trailing /rest/v1 suffixes
const rawUrl = getRawURL().trim();
const supabaseUrl = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const supabaseAnonKey = getRawKey().trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('MusicBridge ERROR: Supabase credentials missing.');
} else {
  console.log('MusicBridge: Supabase Client Initialized', { 
    endpoint: supabaseUrl.substring(0, 20) + '...',
    hasKey: !!supabaseAnonKey 
  });
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce' // Use modern PKCE flow
    }
  }
);

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    // Note: _test_connection might not exist, but a 404/400 from Supabase 
    // is better than a generic network error as it confirms the API key is accepted.
    if (error && error.message.includes('apikey')) {
      return { success: false, message: 'Invalid API Key' };
    }
    return { success: true, message: 'Connected to Supabase API' };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
};
