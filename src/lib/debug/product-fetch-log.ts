import type { PostgrestError } from "@supabase/supabase-js";

const PREFIX = "[ProductDebug]";

export function formatSupabaseError(error: PostgrestError | null | undefined) {
  if (!error) return null;
  return {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
}

type ProductFetchLog = {
  page: string;
  query: string;
  count?: number;
  error?: ReturnType<typeof formatSupabaseError>;
  meta?: Record<string, unknown>;
};

/** Temporary production debugging — remove after DB issue is resolved. */
export function logProductFetch(payload: ProductFetchLog) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "unknown";

  console.log(PREFIX, {
    ...payload,
    ts: new Date().toISOString(),
    supabaseProject: projectRef,
  });
}
