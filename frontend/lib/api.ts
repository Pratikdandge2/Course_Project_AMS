const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export type ApiError = { error: string; details?: unknown };

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (init.token) headers.set("authorization", `Bearer ${init.token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const data = await parseJson<any>(res).catch(() => ({ error: "Request failed" }));

  if (!res.ok) {
    const msg = data.details 
      ? `${data.error}: ${data.details.map((d: any) => `${d.path.join(".")}: ${d.message}`).join(", ")}`
      : data.error || "Request failed";
    throw new Error(msg);
  }

  return data as T;
}

