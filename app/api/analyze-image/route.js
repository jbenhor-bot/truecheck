import { analyzeExif } from "../../../lib/image/exifAnalyzer";

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

      const exifResult = await analyzeExif(image);

      let baseScore = 35;
      let finalScore = baseScore + exifResult.exifScore;

      if (finalScore > 100) finalScore = 100;
      if (finalScore < 0) finalScore = 0;

      let attentionLevel = "baixo";
      if (finalScore >= 70) {
        attentionLevel = "alto";
      } else if (finalScore >= 40) {
        attentionLevel = "médio";
      }

      let classification = "baixo risco inicial";
      if (finalScore >= 70) {
        classification = "requer atenção";
      } else if (finalScore >= 40) {
        classification = "análise inicial concluída";
      }

      const detectedSignals = [
        "Arquivo recebido com sucesso",
        "Upload por arquivo funcionando",
        ...exifResult.exifSignals
      ];

      return Response.json({
        ok: true,
        sourceType: "file",
        classification,
        attentionLevel,
        score: finalScore,
        file: {
          name: image.name,
          type: image.type,
          sizeBytes: sizeInBytes,
          sizeMB: sizeInMB
        },
        exif: exifResult.exifData,
        detectedSignals,
        recommendation:
          "A imagem já passou por triagem de metadados. O próximo passo é combinar EXIF, sinais visuais e detecção de geração por IA.",
        nextStep: "Conectar detector visual e score engine."
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
            ? [`Palavras suspeitas na URL: ${foundWords.join(", ")}`]
            : ["Nenhum sinal forte encontrado na URL"],
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
