export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    if (!text) {
      return Response.json(
        { error: "Texto não enviado." },
        { status: 400 }
      );
    }

    let classification = "Conteúdo informativo";
    let summary =
      "O texto foi recebido e passou por uma análise inicial de linguagem e contexto.";
    let recommendation =
      "Compare a informação com fontes confiáveis e confira a data da publicação.";

    const lower = text.toLowerCase();

    if (
      lower.includes("urgente") ||
      lower.includes("compartilhe") ||
      lower.includes("antes que apaguem") ||
      lower.includes("a mídia não mostra") ||
      lower.includes("verdade escondida")
    ) {
      classification = "Possível conteúdo sensacionalista";
      summary =
        "O texto contém sinais comuns de apelo emocional ou linguagem de urgência exagerada.";
      recommendation =
        "Evite compartilhar antes de confirmar em fontes jornalísticas confiáveis.";
    }

    if (
      lower.includes("100% garantido") ||
      lower.includes("sem nenhuma dúvida") ||
      lower.includes("todos estão escondendo")
    ) {
      classification = "Possível desinformação";
      summary =
        "Foram identificadas expressões absolutas e linguagem que pode indicar baixa confiabilidade.";
      recommendation =
        "Verifique autores, data, fonte original e confirmação independente.";
    }

    return Response.json({
      classification,
      summary,
      recommendation,
    });
  } catch (error) {
    return Response.json(
      { error: "Erro ao analisar o texto." },
      { status: 500 }
    );
  }
}
