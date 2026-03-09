export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // CASO 1: envio por arquivo
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const image = formData.get("image");

      if (!image) {
        return Response.json(
          {
            ok: false,
            error: "Nenhuma imagem enviada."
          },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const sizeInBytes = bytes.byteLength;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

      return Response.json({
        ok: true,
        sourceType: "file",
        classification: "análise inicial concluída",
        attentionLevel: "médio",
        score: 55,
        file: {
          name: image.name,
          type: image.type,
          sizeBytes: sizeInBytes,
          sizeMB: sizeInMB
        },
        detectedSignals: [
          "arquivo recebido com sucesso",
          "upload por arquivo funcionando",
          "backend pronto para próxima etapa de análise"
        ],
        recommendation:
          "O arquivo foi enviado corretamente. Agora a próxima evolução é analisar metadados, conteúdo visual e sinais de geração por IA.",
        nextStep: "Conectar motor de análise de imagem."
      });
    }

    // CASO 2: envio por URL
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const imageUrl = body.imageUrl?.trim();

      if (!imageUrl) {
        return Response.json(
          {
            ok: false,
            error: "URL da imagem não informada."
          },
          { status: 400 }
        );
      }

      let domain = "desconhecido";

      try {
        domain = new URL(imageUrl).hostname;
      } catch (error) {
        return Response.json(
          {
            ok: false,
            error: "URL inválida."
          },
          { status: 400 }
        );
      }

      const suspiciousWords = [
        "generated",
        "ai",
        "fake",
        "edited",
        "midjourney",
        "dalle",
        "stable-diffusion"
      ];

      const foundWords = suspiciousWords.filter((word) =>
        imageUrl.toLowerCase().includes(word)
      );

      return Response.json({
        ok: true,
        sourceType: "url",
        classification:
          foundWords.length > 0 ? "suspeita inicial" : "análise inicial concluída",
        attentionLevel: foundWords.length > 0 ? "alto" : "baixo",
        score: foundWords.length > 0 ? 75 : 25,
        url: imageUrl,
        domain,
        detectedSignals:
          foundWords.length > 0
            ? [`palavras suspeitas na URL: ${foundWords.join(", ")}`]
            : ["nenhum sinal forte encontrado na URL"],
        recommendation:
          foundWords.length > 0
            ? "Fazer verificação mais profunda, incluindo busca reversa e análise visual."
            : "A URL não apresentou sinais fortes nesta triagem inicial.",
        nextStep: "Conectar verificações externas e análise visual."
      });
    }

    return Response.json(
      {
        ok: false,
        error: "Tipo de requisição não suportado."
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro em /api/analyze-image:", error);

    return Response.json(
      {
        ok: false,
        error: "Erro interno ao analisar imagem."
      },
      { status: 500 }
    );
  }
}
