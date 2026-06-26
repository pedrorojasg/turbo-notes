import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;
};

/**
 * Server-side fetch helper that automatically attaches the JWT from the
 * httpOnly cookie when `auth: true` (default).  Always targets the Django API.
 */
export async function apiFetch(
  path: string,
  { auth = true, headers = {}, ...rest }: FetchOptions = {}
): Promise<Response> {
  if (auth) {
    const token = (await cookies()).get("access_token")?.value;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}
