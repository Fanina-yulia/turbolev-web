export async function GET() {
  return Response.json({ ok: true, service: "turbolev-web", version: "foundation-v0.1" });
}
