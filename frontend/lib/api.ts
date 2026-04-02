const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type ApiError = { error: string; details?: unknown };

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

/**
 * Thin fetch wrapper used throughout the app.
 *
 * Network-level failures (ECONNREFUSED, timeout, DNS, …) are caught here and
 * return an empty-array sentinel so Server Components never crash when the
 * backend is offline.  HTTP-level errors (4xx / 5xx) still throw so callers
 * can surface meaningful messages to the user.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);

  // ── 1. Network layer ────────────────────────────────────────────────────
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (networkErr) {
    // Backend is unreachable (ECONNREFUSED, offline, wrong port, etc.).
    // Log once in development so the dev knows, then return a safe default.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[apiFetch] Cannot reach ${API_URL}${path} — is the backend running?`,
        networkErr instanceof Error ? networkErr.message : networkErr,
      );
    }
    // Return an empty array; all landing-page endpoints return arrays and
    // the Server Component already guards on `data ? ... : <Skeleton />`.
    return [] as unknown as T;
  }

  // ── 2. Parse body ───────────────────────────────────────────────────────
  const data = await parseJson<any>(res).catch(() => ({
    error: "Failed to parse server response",
  }));

  // ── 3. HTTP error layer ─────────────────────────────────────────────────
  if (!res.ok) {
    let msg = "Request failed";
    if (data?.details && Array.isArray(data.details)) {
      msg = `${data.error ?? "Error"}: ${data.details
        .map((d: any) =>
          Array.isArray(d?.path)
            ? `${d.path.join(".")}: ${d.message}`
            : (d?.message ?? JSON.stringify(d)),
        )
        .join(", ")}`;
    } else if (data?.error) {
      msg = data.error;
    }
    throw new Error(msg);
  }

  return data as T;
}
