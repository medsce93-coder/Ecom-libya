import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure them before running the app.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const WHATSAPP_NUMBER =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "212765074750";
export const COUPON_CODE =
  (import.meta.env.VITE_COUPON_CODE as string) || "";

export const ADMIN_EMAIL: string =
  (import.meta.env.VITE_ADMIN_EMAIL as string) || "";
