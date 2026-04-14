import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wkwyvlrkjpecwiwmxlcw.supabase.co";
const SUPABASE_KEY = "sb_publishable_z-Rmb1bXxAUGcfgf5dnZwg_xMh6ACqT";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const WHATSAPP_NUMBER = "212765074750";
export const COUPON_CODE = "خصم10";

export const ADMIN_EMAIL: string = (import.meta.env.VITE_ADMIN_EMAIL as string) || "";
