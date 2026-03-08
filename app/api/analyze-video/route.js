export async function POST(request) {
  try {
    const body = await request.json();

    const fileName = body.fileName?.toLowerCase() || "";
    const fileSize = Number(body.fileSize || 0);
    const duration = Number(body.duration || 0);

    let attentionScore = 28;
    let classification = "Vídeo recebido para triagem inicial.";
    let observation =
      "A análise inicial considera nome do arquivo, duração e tamanho do vídeo.";
    let detectedSigns = [
      "Triagem inicial baseada em metadados enviados pelo navegador.",
      "O vídeo ainda precisa de análise visual mais profunda.",
      "A origem e o contexto continuam sendo fundamentais.",
    ];
    let recommendation =
      "Use esta etapa como triagem inicial. O ideal é complementar com revisão quadro a quadro e checagem da origem.";
    let nextStep =
      "Próximo passo: ampliar a análise de frames, áudio e contexto do vídeo.";

    if (
      fileName.includes("deepfake") ||
      fileName.includes("fake") ||
      fileName.includes("ai") ||
      fileName.includes("edited") ||
      fileName.includes("synthetic")
    ) {
      attentionScore = 76;
      classification = "Vídeo com indícios que exigem atenção reforçada.";
      observation =
        "O nome do arquivo sugere possível manipulação, geração sintética ou deepfake.";
      detectedSigns = [
        "O nome do arquivo sugere possível conteúdo manipulado.",
        "É recomendada análise detalhada de rosto, cortes e sincronização.",
        "A origem do vídeo deve ser validada antes de compartilhamento.",
      ];
      recommendation =
        "Evite compartilhar antes de validar a fonte, comparar versões e revisar os frames extraídos.";
      nextStep =
        "Próximo passo: análise aprofundada de deepfake, cortes e consistência visual.";
    } else if (fileSize > 50 * 1024 * 1024) {
      attentionScore = 52;
      classification = "Vídeo grande recebido para análise técnica.";
      observation =
        "Arquivos maiores podem preservar mais detalhes úteis para investigação.";
      detectedSigns = [
        "O vídeo possui tamanho suficiente para preservar mais informação visual.",
        "Pode ser útil analisar compressão, continuidade e contexto.",
        "A análise completa deve incluir revisão visual e comparação externa.",
      ];
      recommendation =
        "Aproveitar a maior riqueza visual do arquivo para uma inspeção técnica mais detalhada.";
      nextStep =
        "Próximo passo: aprofundar a análise de frames e sinais de edição.";
    } else if (duration > 20) {
      attentionScore = 46;
      classification = "Vídeo mais longo com necessidade de revisão gradual.";
      observation =
        "Vídeos mais longos podem esconder sinais de manipulação em trechos específicos.";
      detectedSigns = [
        "A duração maior pede revisão por trechos.",
        "Os frames iniciais ajudam, mas não substituem análise completa.",
        "É recomendável verificar cenas adicionais fora da triagem inicial.",
      ];
      recommendation =
        "Extrair mais quadros ao longo do vídeo para ampliar a cobertura da análise.";
      nextStep =
        "Próximo passo: revisar trechos adicionais e ampliar a extração de frames.";
    }

    return Response.json({
      attentionScore,
      classification,
      observation,
      detectedSigns,
      recommendation,
      nextStep,
    });
  } catch (error) {
    return Response.json(
      { error: "Erro ao analisar o vídeo." },
      { status: 500 }
    );
  }
}
