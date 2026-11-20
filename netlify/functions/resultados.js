import { getStore } from "@netlify/blobs";

const SENHA = "cyber2026"; // <-- TROQUE ISSO!

export default async (req) => {
  const body = await req.json().catch(() => ({}));
  if (body.senha !== SENHA) {
    return Response.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const store = getStore("urna");

  if (req.method === "DELETE") {
    await store.set("v13", "0");
    await store.set("v22", "0");
    await store.set("brancos", "0");
    const lista = await store.list({ prefix: "eleitor_" });
    for (const item of lista.blobs) {
      await store.delete(item.key);
    }
    return Response.json({ ok: true });
  }

  const [v13, v22, brancos] = await Promise.all([
    store.get("v13").then(v => Number(v) || 0),
    store.get("v22").then(v => Number(v) || 0),
    store.get("brancos").then(v => Number(v) || 0),
  ]);
  return Response.json({ v13, v22, brancos });
};
