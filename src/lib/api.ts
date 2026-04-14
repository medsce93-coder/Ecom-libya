import { supabase } from "./supabase";

export const API_BASE =
  import.meta.env.VITE_API_BASE || "";

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  parseAs?: "json" | "text" | "blob" | "raw";
};

async function getAccessToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = true, parseAs = "json", headers, ...rest } = options;

  const token = auth ? await getAccessToken() : null;
  const mergedHeaders = new Headers(headers || {});

  if (token && !mergedHeaders.has("Authorization")) {
    mergedHeaders.set("Authorization", `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (
      body instanceof FormData ||
      typeof body === "string" ||
      body instanceof URLSearchParams ||
      body instanceof Blob
    ) {
      requestBody = body;
    } else {
      requestBody = JSON.stringify(body);
      if (!mergedHeaders.has("Content-Type")) {
        mergedHeaders.set("Content-Type", "application/json");
      }
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: mergedHeaders,
    body: requestBody,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  if (parseAs === "raw") return response as T;
  if (parseAs === "text") return (await response.text()) as T;
  if (parseAs === "blob") return (await response.blob()) as T;
  if (response.status === 204) return null as T;

  const text = await response.text();
  if (!text.trim()) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
