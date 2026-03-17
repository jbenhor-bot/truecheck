import { buildVideoResult } from "../../../lib/video/videoScoreEngine";
import { detectSyntheticTransformation } from "../../../lib/video/syntheticTransformationDetector";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // CASO 1: JSON (link ou metadados simples)
    if (contentType.includes("application/json")) {
      const body = await request.json();

      const rawFileName = body.fileName || body.videoUrl || body.url || "";
      const fileName = String(rawFileName).toLowerCase();
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

      let baseScore = 38;
      let summary =
        "A análise atual considera sinais básicos enviados pelo navegador e ainda não executa inspeção visual profunda.";
      const baseSignals = [
        "Triagem inicial baseada em metadados enviados pelo navegador",
        "Análise profunda de frames ainda não executada",
        "A origem e o contexto do vídeo continuam sendo fundamentais"
      ];

      if (isSocialVideoLink) {
        baseScore = 62;
        summary =
          "O vídeo foi recebido por link de plataforma externa. Sem análise direta de frames, não é possível concluir autenticidade com segurança.";

        baseSignals.push("O conteúdo veio de plataforma social externa");
        baseSignals.push(
          "Sem acesso direto aos frames, a triagem permanece limitada"
        );
      } else if (fileSize > 50 * 1024 * 1024) {
        baseScore = 56;
        summary =
          "Arquivos maiores podem preservar mais detalhes úteis para investigação técnica.";

        baseSignals.push(
          "O vídeo possui tamanho elevado, podendo preservar mais detalhes visuais"
        );
      } else if (duration > 20) {
        baseScore = 52;
        summary =
          "Vídeos mais longos podem esconder sinais de manipulação em trechos específicos.";

        baseSignals.push(
          "A duração maior exige análise progressiva por trechos"
        );
      }

      const transformationResult = detectSyntheticTransformation(fileName);

      return Response.json(
        buildVideoResult({
          sourceType: isSocialVideoLink ? "video-url" : "video",
          baseScore,
          frameScore: 0,
          transformationScore: transformationResult.transformationScore,
          consistencyScore: 0,
          baseSignals,
          frameSignals: [],
          transformationSignals: transformationResult.detectedSignals,
          consistencySignals: [],
          summary,
          framesAnalyzed: false,
          audioAnalyzed: false,
          socialLinkDetected: isSocialVideoLink,
          hasStrongSyntheticEvidence:
            transformationResult.hasStrongSyntheticEvidence,
          hasTransformationEvidence:
            transformationResult.hasTransformationEvidence,
          extra: {
            technicalScope: {
              framesAnalyzed: false,
              audioAnalyzed: false,
              socialLinkDetected: isSocialVideoLink,
              heuristicOnly: true
            }
          }
        })
      );
    }

    // CASO 2: upload de vídeo (fase 1 ainda sem extração real de frames)
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

      const sizeInBytes = video.size || 0;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      const fileName = String(video.name || "").toLowerCase();

      const maxSizeMB = 60;

      if (sizeInBytes > maxSizeMB * 1024 * 1024) {
        return Response.json(
          {
            ok: false,
            error: `O vídeo excede o limite de ${maxSizeMB} MB para análise inicial.`
          },
          { status: 400 }
        );
      }

      let baseScore = 44;
      let summary =
        "O vídeo foi enviado por upload e passou por triagem inicial de arquivo. A análise profunda de frames ainda será adicionada nas próximas etapas.";
      const baseSignals = [
        "Vídeo recebido com sucesso por upload",
        "Triagem inicial de arquivo executada",
        "Análise quadro a quadro ainda não executada"
      ];

      if (sizeInBytes > 20 * 1024 * 1024) {
        baseScore = 50;
        baseSignals.push(
          "O arquivo possui tamanho suficiente para investigação visual mais rica"
        );
      }

      const transformationResult = detectSyntheticTransformation(fileName);

      return Response.json(
        buildVideoResult({
          sourceType: "video-file",
          baseScore,
          frameScore: 0,
          transformationScore: transformationResult.transformationScore,
          consistencyScore: 0,
          baseSignals,
          frameSignals: [],
          transformationSignals: transformationResult.detectedSignals,
          consistencySignals: [],
          summary,
          framesAnalyzed: false,
          audioAnalyzed: false,
          socialLinkDetected: false,
          hasStrongSyntheticEvidence:
            transformationResult.hasStrongSyntheticEvidence,
          hasTransformationEvidence:
            transformationResult.hasTransformationEvidence,
          extra: {
            file: {
              name: video.name,
              type: video.type,
              sizeBytes: sizeInBytes,
              sizeMB
            },
            technicalScope: {
              framesAnalyzed: false,
              audioAnalyzed: false,
              socialLinkDetected: false,
              heuristicOnly: true
            }
          }
        })
      );
    }

    return Response.json(
      {
        ok: false,
        error: "Tipo de requisição não suportado."
      },
      { status: 400 }
    );
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
