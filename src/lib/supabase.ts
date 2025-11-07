import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase 环境变量未配置");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

