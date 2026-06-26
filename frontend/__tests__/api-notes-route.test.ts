import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Controllable cookie jar for the BFF auth header
let token: string | undefined = "tok123";
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === "access_token" && token ? { value: token } : undefined,
  })),
}));

import { GET, POST } from "@/app/api/notes/route";
import {
  GET as GET_ID,
  PATCH as PATCH_ID,
  DELETE as DELETE_ID,
} from "@/app/api/notes/[id]/route";

function mockFetchOnce(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function authHeaderOf(fetchMock: ReturnType<typeof vi.fn>) {
  const init = fetchMock.mock.calls[0][1] ?? {};
  return (init.headers ?? {}) as Record<string, string>;
}

beforeEach(() => {
  token = "tok123";
  vi.unstubAllGlobals();
});

describe("BFF /api/notes", () => {
  it("GET forwards the category query and attaches the bearer token", async () => {
    const fetchMock = mockFetchOnce(200, [{ id: 1 }]);
    const req = new NextRequest("http://localhost:3000/api/notes?category=2");

    const res = await GET(req);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain("/api/notes/?category=2");
    expect(authHeaderOf(fetchMock).Authorization).toBe("Bearer tok123");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 1 }]);
  });

  it("GET passes through the upstream status code (e.g. 401)", async () => {
    mockFetchOnce(401, { detail: "Authentication credentials were not provided." });
    const req = new NextRequest("http://localhost:3000/api/notes");

    const res = await GET(req);

    expect(res.status).toBe(401);
  });

  it("GET omits the Authorization header when there is no cookie", async () => {
    token = undefined;
    const fetchMock = mockFetchOnce(401, {});
    const req = new NextRequest("http://localhost:3000/api/notes");

    await GET(req);

    expect(authHeaderOf(fetchMock).Authorization).toBeUndefined();
  });

  it("POST forwards the body to Django with auth + content-type", async () => {
    const fetchMock = mockFetchOnce(201, { id: 9 });
    const req = new NextRequest("http://localhost:3000/api/notes", {
      method: "POST",
      body: JSON.stringify({ title: "", content: "", category_id: 1 }),
    });

    const res = await POST(req);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/notes/");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.headers.Authorization).toBe("Bearer tok123");
    expect(JSON.parse(init.body)).toEqual({ title: "", content: "", category_id: 1 });
    expect(res.status).toBe(201);
  });
});

describe("BFF /api/notes/[id]", () => {
  const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

  it("GET targets the note by id with auth", async () => {
    const fetchMock = mockFetchOnce(200, { id: 5 });
    const req = new NextRequest("http://localhost:3000/api/notes/5");

    const res = await GET_ID(req, ctx("5"));

    expect(fetchMock.mock.calls[0][0]).toContain("/api/notes/5/");
    expect(authHeaderOf(fetchMock).Authorization).toBe("Bearer tok123");
    expect(res.status).toBe(200);
  });

  it("PATCH forwards the patch body and passes through status", async () => {
    const fetchMock = mockFetchOnce(200, { id: 5, title: "Updated" });
    const req = new NextRequest("http://localhost:3000/api/notes/5", {
      method: "PATCH",
      body: JSON.stringify({ title: "Updated" }),
    });

    const res = await PATCH_ID(req, ctx("5"));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/api/notes/5/");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ title: "Updated" });
    expect(res.status).toBe(200);
  });

  it("DELETE returns a 204 with no body", async () => {
    const fetchMock = mockFetchOnce(204, null);
    const req = new NextRequest("http://localhost:3000/api/notes/5", {
      method: "DELETE",
    });

    const res = await DELETE_ID(req, ctx("5"));

    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
    expect(res.status).toBe(204);
  });
});
