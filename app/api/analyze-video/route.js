import { buildVideoResult } from "../../../lib/video/videoScoreEngine";
import { detectSyntheticTransformation } from "../../../lib/video/syntheticTransformationDetector";

function isSocialVideoLink(value = "") {
  const fileName = String(value || "").toLowerCase();

  return (
    fileName.includes("youtube.com") ||
    fileName.includes("youtu.be") ||
    fileName.includes("tiktok.com") ||
    fileName.includes("instagram.com/reel") ||
    fileName.includes("instagram.com/p/") ||
    fileName.includes("facebook.com/watch") ||
    fileName.includes("facebook.com/reel") ||
    fileName.includes("x.com/") ||
    fileName.includes("twitter.com/")
  );
}

function buildBaseVideoSignals({
  fileName = "",
  fileSize = 0,
  duration = 0,
  socialLinkDetected = false
}) {
  let baseScore = 8;
  const baseSignals = [];
  let hasStrongSyntheticEvidence = false;

  const normalizedName = String(fileName || "").toLowerCase();

  const suspiciousTerms = [
    "ai",
    "ia",
    "generated",
    "synthetic",
    "deepfake",
    "face swap",
    "faceswap",
    "midjourney",
    "runway",
    "pika",
    "sora",
    "heygen",
    "avatar",
    "text to video",
    "text-to-video",
    "render",
    "cgi"
  ];

  for (const term of suspiciousTerms) {
    if (normalizedName.includes(term)) {
      baseScore += 12;
      baseSignals.push(`termo sugestivo no nome/metadado: ${term}`);
    }
  }

  if (socialLinkDetected) {
    baseScore += 10;
    baseSignals.push("link de rede social analisado apenas como triagem inicial");
  }

  if (duration > 0 && duration <= 8) {
    baseScore += 8;
    baseSignals.push("vídeo muito curto, padrão comum em conteúdo sintético viral");
  }

  if (duration > 8 && duration <= 20) {
    baseScore += 4;
    baseSignals.push("duração curta compatível com conteúdo social manipulado");
  }

  if (fileSize > 0 && duration > 0) {
    const bytesPerSecond = fileSize / Math.max(duration, 1);

    if (bytesPerSecond < 40000) {
      baseScore += 10;
      baseSignals.push("densidade de arquivo incomum para a duração declarada");
    } else if (bytesPerSecond < 80000) {
      baseScore += 5;
      baseSignals.push("compressão relevante em relação à duração");
    }
  }

  const strongTerms = [
    "deepfake",
    "faceswap",
    "face swap",
    "synthetic",
    "generated",
    "text to video",
    "text-to-video",
    "heygen",
    "sora"
  ];

  if (strongTerms.some((term) => normalizedName.includes(term))) {
    hasStrongSyntheticEvidence = true;
  }

  if (baseScore > 100) baseScore = 100;

  return {
    baseScore,
    baseSignals,
    hasStrongSyntheticEvidence
  };
}

async function analyzeVideoInput({
  fileName = "",
  fileSize = 0,
  duration = 0,
  sourceType = "video"
}) {
  const socialLinkDetected = isSocialVideoLink(fileName);

  const {
    baseScore,
    baseSignals,
    hasStrongSyntheticEvidence: strongEvidenceFromBase
  } = buildBaseVideoSignals({
    fileName,
    fileSize,
    duration,
    socialLinkDetected
  });

  let transformationScore = 0;
  let transformationSignals = [];
  let hasTransformationEvidence = false;
  let hasStrongSyntheticEvidence = strongEvidenceFromBase;

  try {
    const transformationResult = await detectSyntheticTransformation({
      fileName,
      fileSize,
      duration,
      sourceType
    });

    transformationScore = Number(transformationResult?.score || 0);
    transformationSignals = Array.isArray(transformationResult?.signals)
      ? transformationResult.signals
      : [];
    hasTransformationEvidence = Boolean(
      transformationResult?.hasTransformationEvidence
    );

    if (transformationResult?.hasStrongSyntheticEvidence) {
      hasStrongSyntheticEvidence = true;
    }
  } catch (error) {
    transformationSignals.push("não foi possível concluir toda a triagem de transformação visual");
  }

  const framesAnalyzed = false;
  const frameScore = 0;
  const frameSignals = [];

  const consistencyScore = 0;
  const consistencySignals = [];

  return buildVideoResult({
    sourceType,
    baseScore,
    frameScore,
    transformationScore,
    consistencyScore,
    baseSignals,
    frameSignals,
    transformationSignals,
    consistencySignals,
    summary: socialLinkDetected
      ? "Triagem inicial de vídeo concluída a partir de link/metadados. A análise profunda depende de frames."
      : "Triagem inicial de vídeo concluída com análise heurística e sinais de transformação.",
    framesAnalyzed,
    audioAnalyzed: false,
    socialLinkDetected,
    hasStrongSyntheticEvidence,
    hasTransformationEvidence,
    extra: {
      fileName,
      fileSize,
      duration
    }
  });
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // CASO 1: JSON (link ou metadados)
    if (contentType.includes("application/json")) {
      const body = await request.json();

      const rawFileName =
        body.fileName || body.videoUrl || body.url || body.name || "";
      const fileName = String(rawFileName || "");
      const fileSize = Number(body.fileSize || 0);
      const duration = Number(body.duration || 0);

      const result = await analyzeVideoInput({
        fileName,
        fileSize,
        duration,
        sourceType: "video"
      });

      return Response.json(result, { status: 200 });
    }

    // CASO 2: upload por arquivo
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const video = formData.get("video");

      if (!video) {
        return Response.json(
          {
            ok: false,
            error: "Nenhum vídeo enviado."
          },
          { status: 400 }
        );
      }

      const fileName = String(video.name || "");
      const fileSize = Number(video.size || 0);

      // duração opcional vinda do formData
      const rawDuration = formData.get("duration");
      const duration = Number(rawDuration || 0);

      const result = await analyzeVideoInput({
        fileName,
        fileSize,
        duration,
        sourceType: "video"
      });

      return Response.json(result, { status: 200 });
    }

    return Response.json(
      {
        ok: false,
        error: "Formato não suportado. Envie JSON ou multipart/form-data."
      },
      { status: 415 }
    );
  } catch (error) {
    console.error("Erro em /api/analyze-video:", error);

    return Response.json(
      {
        ok: false,
        error: "Falha ao analisar o vídeo."
      },
      { status: 500 }
    );
  }
}
