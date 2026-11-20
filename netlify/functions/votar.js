import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { voto, eleitorId } = await req.json();

    if (!eleitorId || typeof eleitorId !== "string" || eleitorId.length < 5) {
      return Response.json({ ok: false, erro: "Identificador inválido" }, { status: 400 });
    }

    const chave = voto === "13" ? "v13" : voto === "22" ? "v22" : "brancos";
    if (!["v13", "v22", "brancos"].includes(chave)) {
      return Response.json({ ok: false, erro: "Voto inválido" }, { status: 400 });
    }

    const store = getStore("urna");

    const chaveEleitor = "eleitor_" + eleitorId;
    const jaVotou = await store.get(chaveEleitor);
    if (jaVotou) {
      return Response.json({ ok: false, jaVotou: true, erro: "Você já votou" }, { status: 200 });
    }

    await store.set(chaveEleitor, "1");
    const atual = Number(await store.get(chave)) || 0;
    await store.set(chave, String(atual + 1));

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, erro: e.message }, { status: 500 });
  }
};
