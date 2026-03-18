import { buildVideoResult } from "../../../lib/video/videoScoreEngine";
import { detectSyntheticTransformation } from "../../../lib/video/syntheticTransformationDetector";
import { extractFrames } from "../../../lib/video/extractFrames";
import { analyzeFrames } from "../../../lib/video/frameAnalyzer";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { ok: false, error: "Envie o vídeo como upload." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const video = formData.get("video");

    if (!video) {
      return Response.json(
        { ok: false, error: "Nenhum vídeo enviado." },
        { status: 400 }
      );
    }

    const fileName = String(video.name || "");
    const fileSize = Number(video.size || 0);

    // transformação heurística inicial
    const transformation = await detectSyntheticTransformation({
      fileName,
      fileSize,
      duration: 0,
      sourceType: "video"
    });

    // EXTRAIR FRAMES 🔥
    const framesResult = await extractFrames({
      file: video,
      fileName
    });

    let frameScore = 0;
    let frameSignals = [];
    let framesAnalyzed = false;

    if (framesResult.ok && framesResult.frames.length > 0) {
      const frameAnalysis = await analyzeFrames(framesResult.frames);

      frameScore = frameAnalysis.score;
      frameSignals = frameAnalysis.signals;
      framesAnalyzed = true;

      // limpar arquivos temporários
      if (framesResult.cleanup) {
        framesResult.cleanup();
      }
    }

    const result = buildVideoResult({
      sourceType: "video",
      baseScore: 15,
      frameScore,
      transformationScore: transformation.score,
      consistencyScore: 0,
      baseSignals: [],
      frameSignals,
      transformationSignals: transformation.signals,
      consistencySignals: [],
      summary: framesAnalyzed
        ? "Análise visual quadro a quadro realizada."
        : "Triagem inicial sem extração de frames.",
      framesAnalyzed,
      audioAnalyzed: false,
      socialLinkDetected: false,
      hasStrongSyntheticEvidence:
        transformation.hasStrongSyntheticEvidence,
      hasTransformationEvidence:
        transformation.hasTransformationEvidence
    });

    return Response.json(result);
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, error: "Erro ao analisar vídeo." },
      { status: 500 }
    );
  }
}
