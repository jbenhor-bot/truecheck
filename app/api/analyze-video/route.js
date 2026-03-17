export async function POST(request) {
  try {
    const body = await request.json();

    const fileName = body.fileName?.toLowerCase() || "";
    const fileSize = Number(body.fileSize || 0);
    const duration = Number(body.duration || 0);

    let score = 28;
    let attentionLevel = "baixo";
    let classification = "vídeo recebido para triagem inicial";
    let summary =
      "A análise inicial considera nome do arquivo, duração e tamanho do vídeo.";
    let recommendation =
      "Use esta etapa como triagem inicial. O ideal é complementar com revisão quadro a quadro e checagem da origem.";
    let nextStep =
      "Ampliar a análise com extração de frames, verificação de cortes e avaliação de consistência visual.";
    const detectedSignals = [
      "Triagem inicial baseada em metadados enviados pelo navegador",
      "Análise visual profunda ainda não executada",
      "Contexto e origem do vídeo ainda precisam ser verificados"
    ];

    // sinais fortes no nome do arquivo
    if (
      fileName.includes("deepfake") ||
      fileName.includes("fake") ||
      fileName.includes("ai") ||
      fileName.includes("edited") ||
      fileName.includes("synthetic")
    ) {
      score = 76;
      attentionLevel = "alto";
      classification = "vídeo com indícios que exigem atenção reforçada";
      summary =
        "O nome do arquivo sugere possível manipulação, geração sintética ou deepfake.";
      recommendation =
        "Evite compartilhar antes de validar a fonte e revisar o conteúdo quadro a quadro.";
      nextStep =
        "Executar análise aprofundada de deepfake, sincronização labial e continuidade visual.";

      detectedSignals.push(
        "O nome do arquivo sugere possível conteúdo manipulado ou sintético"
      );
    }

    // arquivo grande
    else if (fileSize > 50 * 1024 * 1024) {
      score = 52;
      attentionLevel = "médio";
      classification = "vídeo técnico com necessidade de revisão detalhada";
      summary =
        "Arquivos maiores preservam mais detalhes úteis para investigação técnica.";
      recommendation =
        "Aproveitar a maior qualidade visual para inspeção de compressão e cortes.";
      nextStep =
        "Extrair frames estratégicos e analisar consistência visual ao longo do vídeo.";

      detectedSignals.push(
        "O vídeo possui tamanho elevado, podendo conter maior riqueza de detalhes visuais"
      );
    }

    // vídeo longo
    else if (duration > 20) {
      score = 46;
      attentionLevel = "médio";
      classification = "vídeo mais longo com necessidade de revisão gradual";
      summary =
        "Vídeos mais longos podem esconder sinais de manipulação em trechos específicos.";
      recommendation =
        "Realizar revisão por segmentos e extrair quadros adicionais.";
      nextStep =
        "Ampliar cobertura da análise ao longo da linha do tempo do vídeo.";

      detectedSignals.push(
        "A duração maior exige análise progressiva por trechos"
      );
    }

    return Response.json({
      ok: true,
      sourceType: "video",
      classification,
      attentionLevel,
      score,
      summary,
      detectedSignals,
      recommendation,
      nextStep
    });
  } catch (error) {
    console.error("Erro em /api/analyze-video:", error);

    return Response.json(
      {
        ok: false,
        error: "Erro ao analisar o vídeo.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
