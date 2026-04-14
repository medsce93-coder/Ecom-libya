import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendJson } from "./http";

let cachedClient: ReturnType<typeof createClient> | null = null;

function getAdminClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for admin checks",
    );
  }

  cachedClient = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

function getBearerToken(req: VercelRequest) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) {
    sendJson(res, 401, {
      error: "unauthorized",
      message: "Missing admin token",
    });
    return null;
  }

  let user: User | null = null;
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      sendJson(res, 401, {
        error: "unauthorized",
        message: "Invalid admin token",
      });
      return null;
    }
    user = data.user;
  } catch (error) {
    sendJson(res, 500, {
      error: "server_error",
      message: "Failed to validate admin token",
    });
    return null;
  }

  const adminEmail =
    (process.env.ADMIN_EMAIL ?? "").trim();

  if (adminEmail) {
    if (user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
      sendJson(res, 403, {
        error: "forbidden",
        message: "Admin access denied",
      });
      return null;
    }
  } else {
    const role =
      (user.app_metadata?.role as string | undefined) ??
      (user.user_metadata?.role as string | undefined);
    if (role !== "admin") {
      sendJson(res, 403, {
        error: "forbidden",
        message:
          "Admin access denied. Set ADMIN_EMAIL or role=admin metadata.",
      });
      return null;
    }
  }

  return user;
}

export function getSupabaseAdminStorageClient() {
  return getAdminClient();
}
