import { getStore } from "@netlify/blobs";

// Counts every request for the game's page: players, repeat visits, bots and crawlers alike.
// GET /api/views returns the total as {"views": n}.
export default async (request, context) => {
  const store = getStore({ name: "counter", consistency: "strong" });
  const read = async () => Number(await store.get("views")) || 0;
  if (new URL(request.url).pathname === "/api/views") {
    // VIEWS_BASE (a Netlify environment variable) adds the views from before this counter existed
    const base = Number((globalThis.Netlify && Netlify.env.get("VIEWS_BASE")) || 0) || 0;
    return new Response(JSON.stringify({ views: base + (await read()) }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  try { await store.set("views", String((await read()) + 1)); } catch (e) {}
  return context.next();
};

export const config = { path: ["/", "/index.html", "/api/views"] };
