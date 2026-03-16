import { analyzeExif } from "../../../lib/image/exifAnalyzer";
import { analyzeVisual } from "../../../lib/image/visualDetector";

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
      const buffer = Buffer.from(bytes);
      const sizeInBytes = bytes.byteLength;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

      const exifResult = await analyzeExif(image);

      const hasExif =
        !!exifResult?.exifData && Object.keys(exifResult.exifData).length > 0;

      const visualResult = await analyzeVisual(buffer, hasExif);

      let baseScore = 20;
      let finalScore =
        baseScore + exifResult.exifScore + visualResult.visualScore;

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
        ...(exifResult.exifSignals || []),
        ...(visualResult.notes || [])
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
        exif: {
          score: exifResult.exifScore,
          data: exifResult.exifData,
          signals: exifResult.exifSignals || []
        },
        visual: {
          score: visualResult.visualScore,
          verdict: visualResult.verdict,
          textureStd: visualResult.textureStd,
          metrics: visualResult.metrics,
          notes: visualResult.notes
        },
        detectedSignals,
        recommendation:
          "A imagem passou por triagem de metadados e análise visual inicial. O próximo passo é combinar EXIF, sinais visuais e score engine.",
        nextStep: "Conectar score engine e exibir resultado visual no frontend."
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
        error: "Erro interno ao analisar imagem.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
