export async function POST(request) {
  try {
    const body = await request.json();

    const rawFileName = body.fileName || "";
    const fileName = rawFileName.toLowerCase();
    const fileSize = Number(body.fileSize || 0);
    const duration = Number(body.duration || 0);

    const isSocialVideoLink =
      fileName.includes("youtube.com") ||
      fileName.includes("youtu.be") ||
      fileName.includes("tiktok.com") ||
      fileName.includes("instagram.com/reel") ||
      fileName.includes("instagram.com/p/") ||
      fileName.includes("facebook.com/watch") ||
      fileName.includes("facebook.com/reel") ||
      fileName.includes("x.com") ||
      fileName.includes("twitter.com");

    let score = 38;
    let attentionLevel = "médio";
    let classification = "triagem inicial de vídeo concluída";
    let summary =
      "A análise atual considera sinais básicos enviados pelo navegador e ainda não executa inspeção visual profunda.";
    let recommendation =
      "Use este resultado apenas como triagem inicial. O ideal é complementar com revisão quadro a quadro, checagem da origem e comparação com a publicação original.";
    let nextStep =
      "Ampliar a análise com extração de frames, verificação de cortes, contexto e consistência visual.";
    const detectedSignals = [
      "Triagem inicial baseada em metadados enviados pelo navegador",
      "Análise profunda de frames ainda não executada",
      "A origem e o contexto do vídeo continuam sendo fundamentais"
    ];

    if (isSocialVideoLink) {
      score = 62;
      attentionLevel = "médio";
      classification = "conteúdo externo com necessidade de validação adicional";
      summary =
        "O vídeo foi recebido por link de plataforma externa. Sem análise direta de frames, não é possível concluir autenticidade com segurança.";
      recommendation =
        "Evite interpretar este resultado como confirmação de autenticidade. Verifique a fonte original, contexto da postagem e, se possível, extraia frames para análise mais profunda.";
      nextStep =
        "Executar análise visual de frames, buscar contexto da publicação e comparar com outras versões do vídeo.";

      detectedSignals.push(
        "O conteúdo veio de plataforma social externa"
      );
      detectedSignals.push(
        "Sem acesso direto aos frames, a triagem permanece limitada"
      );
    }

    if (
      fileName.includes("deepfake") ||
      fileName.includes("fake") ||
      fileName.includes("ai") ||
      fileName.includes("edited") ||
      fileName.includes("synthetic")
    ) {
      score = 82;
      attentionLevel = "alto";
      classification = "vídeo com indícios que exigem atenção reforçada";
      summary =
        "O nome do arquivo ou link sugere possível manipulação, geração sintética ou deepfake.";
      recommendation =
        "Evite compartilhar antes de validar a fonte, revisar o contexto e executar análise visual mais profunda.";
      nextStep =
        "Executar análise aprofundada de deepfake, sincronização labial, continuidade visual e coerência entre frames.";

      detectedSignals.push(
        "Foram encontrados termos associados a manipulação ou geração sintética"
      );
    } else if (!isSocialVideoLink && fileSize > 50 * 1024 * 1024) {
      score = 56;
      attentionLevel = "médio";
      classification = "vídeo técnico com necessidade de revisão detalhada";
      summary =
        "Arquivos maiores podem preservar mais detalhes úteis para investigação técnica.";
      recommendation =
        "Aproveitar a maior qualidade visual para inspeção de compressão, continuidade e possíveis sinais de edição.";
      nextStep =
        "Extrair frames estratégicos e ampliar a verificação visual ao longo do vídeo.";

      detectedSignals.push(
        "O vídeo possui tamanho elevado, podendo preservar mais detalhes visuais"
      );
    } else if (!isSocialVideoLink && duration > 20) {
      score = 52;
      attentionLevel = "médio";
      classification = "vídeo mais longo com necessidade de revisão gradual";
      summary =
        "Vídeos mais longos podem esconder sinais de manipulação em trechos específicos.";
      recommendation =
        "Realizar revisão por segmentos e ampliar a amostragem de quadros.";
      nextStep =
        "Expandir a análise ao longo da linha do tempo do vídeo.";

      detectedSignals.push(
        "A duração maior exige análise progressiva por trechos"
      );
    }

    return Response.json({
      ok: true,
      sourceType: isSocialVideoLink ? "video-url" : "video",
      classification,
      attentionLevel,
      score,
      summary,
      detectedSignals,
      recommendation,
      nextStep,
      technicalScope: {
        framesAnalyzed: false,
        audioAnalyzed: false,
        socialLinkDetected: isSocialVideoLink
      }
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
