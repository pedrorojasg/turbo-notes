import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.toString();
  const res = await fetch(
    `${API_URL}/api/notes/${query ? `?${query}` : ""}`,
    { headers: await getAuthHeader() }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_URL}/api/notes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeader()) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
