export async function detectSyntheticTransformation({
  fileName = "",
  fileSize = 0,
  duration = 0,
  sourceType = "video"
}) {
  let score = 0;
  const signals = [];
  let hasTransformationEvidence = false;
  let hasStrongSyntheticEvidence = false;

  const normalized = String(fileName || "").toLowerCase();

  const transformationTerms = [
    "deepfake",
    "faceswap",
    "face swap",
    "synthetic",
    "generated",
    "ai",
    "ia",
    "avatar",
    "text-to-video",
    "text to video",
    "sora",
    "runway",
    "pika",
    "heygen",
    "cgi",
    "render"
  ];

  for (const term of transformationTerms) {
    if (normalized.includes(term)) {
      score += 18;
      signals.push(`indício de transformação/generação no metadado: ${term}`);
    }
  }

  const strongTerms = [
    "deepfake",
    "faceswap",
    "face swap",
    "synthetic",
    "generated",
    "text-to-video",
    "text to video",
    "heygen",
    "sora"
  ];

  if (strongTerms.some((term) => normalized.includes(term))) {
    hasStrongSyntheticEvidence = true;
    hasTransformationEvidence = true;
    score += 20;
    signals.push("conjunto forte de termos associado a conteúdo sintético");
  }

  if (duration > 0 && duration <= 6) {
    score += 10;
    signals.push("duração extremamente curta compatível com geração artificial social");
  } else if (duration > 0 && duration <= 15) {
    score += 5;
    signals.push("duração curta compatível com conteúdo transformado");
  }

  if (fileSize > 0 && duration > 0) {
    const bytesPerSecond = fileSize / Math.max(duration, 1);

    if (bytesPerSecond < 35000) {
      score += 12;
      signals.push("compressão muito agressiva para a duração informada");
    } else if (bytesPerSecond < 70000) {
      score += 6;
      signals.push("compressão relevante que pode mascarar artefatos");
    }
  }

  if (score >= 35) {
    hasTransformationEvidence = true;
  }

  if (score > 100) score = 100;

  return {
    score,
    signals,
    hasTransformationEvidence,
    hasStrongSyntheticEvidence,
    sourceType
  };
}
