export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text?.trim();

    if (!text) {
      return Response.json(
        {
          ok: false,
          error: "Texto não enviado."
        },
        { status: 400 }
      );
    }

    const lower = text.toLowerCase();

    let score = 22;
    let attentionLevel = "baixo";
    let classification = "conteúdo informativo";
    let summary =
      "O texto foi recebido e passou por uma análise inicial de linguagem e contexto.";
    let recommendation =
      "Compare a informação com fontes confiáveis e confira a data da publicação.";
    let nextStep =
      "Ampliar a análise com checagem de fonte, contexto, autor e consistência factual.";
    const detectedSignals = [
      "Texto recebido com sucesso",
      "Triagem inicial de linguagem executada"
    ];

    if (
      lower.includes("urgente") ||
      lower.includes("compartilhe") ||
      lower.includes("antes que apaguem") ||
      lower.includes("a mídia não mostra") ||
      lower.includes("verdade escondida")
    ) {
      score = 58;
      attentionLevel = "médio";
      classification = "possível conteúdo sensacionalista";
      summary =
        "O texto contém sinais comuns de apelo emocional ou linguagem de urgência exagerada.";
      recommendation =
        "Evite compartilhar antes de confirmar em fontes jornalísticas confiáveis.";
      nextStep =
        "Verificar origem, contexto e presença de linguagem manipulativa.";

      detectedSignals.push(
        "Foram detectadas expressões de urgência ou apelo emocional"
      );
    }

    if (
      lower.includes("100% garantido") ||
      lower.includes("sem nenhuma dúvida") ||
      lower.includes("todos estão escondendo")
    ) {
      score = 78;
      attentionLevel = "alto";
      classification = "possível desinformação";
      summary =
        "Foram identificadas expressões absolutas e linguagem que pode indicar baixa confiabilidade.";
      recommendation =
        "Verifique autores, data, fonte original e confirmação independente.";
      nextStep =
        "Ampliar a checagem factual e comparar com fontes independentes.";

      detectedSignals.push(
        "Foram detectadas expressões absolutas ou conclusões sem nuance"
      );
    }

    return Response.json({
      ok: true,
      sourceType: "text",
      classification,
      attentionLevel,
      score,
      summary,
      detectedSignals,
      recommendation,
      nextStep
    });
  } catch (error) {
    console.error("Erro em /api/analyze-text:", error);

    return Response.json(
      {
        ok: false,
        error: "Erro ao analisar o texto.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
