export function normalizeVideoScore({
  baseScore = 0,
  frameScore = 0,
  transformationScore = 0,
  consistencyScore = 0
}) {
  const weightedScore =
    baseScore * 0.2 +
    frameScore * 0.35 +
    transformationScore * 0.3 +
    consistencyScore * 0.15;

  if (weightedScore < 0) return 0;
  if (weightedScore > 100) return 100;

  return Math.round(weightedScore);
}

export function getAttentionLevel(score) {
  if (score >= 71) return "alto";
  if (score >= 41) return "médio";
  return "baixo";
}

export function getClassification(score, context = {}) {
  const {
    hasStrongSyntheticEvidence = false,
    hasTransformationEvidence = false,
    framesAnalyzed = false
  } = context;

  if (hasStrongSyntheticEvidence && score >= 90) {
    return "forte evidência de geração sintética";
  }

  if (hasTransformationEvidence && score >= 80) {
    return "forte suspeita de transformação visual artificial";
  }

  if (framesAnalyzed && score >= 71) {
    return "indícios visuais relevantes de manipulação";
  }

  if (score >= 71) {
    return "conteúdo com alta necessidade de validação";
  }

  if (score >= 41) {
    return "conteúdo com sinais moderados de atenção";
  }

  return "triagem inicial sem sinais fortes";
}

export function buildVideoRecommendation(score, context = {}) {
  const {
    framesAnalyzed = false,
    socialLinkDetected = false,
    hasStrongSyntheticEvidence = false
  } = context;

  if (hasStrongSyntheticEvidence && framesAnalyzed) {
    return "Evite compartilhar como conteúdo autêntico. Há indícios fortes de geração sintética e os frames reforçam a suspeita.";
  }

  if (hasStrongSyntheticEvidence) {
    return "Trate o conteúdo como potencialmente sintético até validação contrária. Os indícios textuais são fortes.";
  }

  if (framesAnalyzed && score >= 71) {
    return "O vídeo merece revisão técnica aprofundada. Os sinais visuais encontrados justificam cautela elevada.";
  }

  if (socialLinkDetected) {
    return "Use este resultado apenas como triagem inicial. Links externos precisam de validação adicional e, idealmente, análise de frames.";
  }

  if (score >= 41) {
    return "Faça checagem complementar de origem, contexto e consistência visual antes de confiar no vídeo.";
  }

  return "A triagem inicial não encontrou sinais fortes, mas a validação da origem continua recomendada.";
}

export function buildVideoNextStep(score, context = {}) {
  const {
    framesAnalyzed = false,
    audioAnalyzed = false,
    socialLinkDetected = false
  } = context;

  if (!framesAnalyzed && socialLinkDetected) {
    return "Próximo passo: obter frames do vídeo ou versão local para análise visual mais profunda.";
  }

  if (!framesAnalyzed) {
    return "Próximo passo: executar extração de frames e análise visual quadro a quadro.";
  }

  if (!audioAnalyzed && score >= 71) {
    return "Próximo passo: complementar com análise temporal, sincronização labial e contexto de publicação.";
  }

  return "Próximo passo: ampliar a análise com consistência temporal, origem e comparação com outras versões do conteúdo.";
}

export function mergeDetectedSignals({
  baseSignals = [],
  frameSignals = [],
  transformationSignals = [],
  consistencySignals = []
}) {
  const merged = [
    ...baseSignals,
    ...frameSignals,
    ...transformationSignals,
    ...consistencySignals
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

  return [...new Set(merged)];
}

export function buildVideoResult({
  sourceType = "video",
  baseScore = 0,
  frameScore = 0,
  transformationScore = 0,
  consistencyScore = 0,
  baseSignals = [],
  frameSignals = [],
  transformationSignals = [],
  consistencySignals = [],
  summary = "Triagem inicial de vídeo concluída.",
  framesAnalyzed = false,
  audioAnalyzed = false,
  socialLinkDetected = false,
  hasStrongSyntheticEvidence = false,
  hasTransformationEvidence = false,
  extra = {}
}) {
  const score = normalizeVideoScore({
    baseScore,
    frameScore,
    transformationScore,
    consistencyScore
  });

  const attentionLevel = getAttentionLevel(score);

  const classification = getClassification(score, {
    hasStrongSyntheticEvidence,
    hasTransformationEvidence,
    framesAnalyzed
  });

  const detectedSignals = mergeDetectedSignals({
    baseSignals,
    frameSignals,
    transformationSignals,
    consistencySignals
  });

  const recommendation = buildVideoRecommendation(score, {
    framesAnalyzed,
    socialLinkDetected,
    hasStrongSyntheticEvidence
  });

  const nextStep = buildVideoNextStep(score, {
    framesAnalyzed,
    audioAnalyzed,
    socialLinkDetected
  });

  return {
    ok: true,
    sourceType,
    classification,
    attentionLevel,
    score,
    summary,
    detectedSignals,
    recommendation,
    nextStep,
    technicalScope: {
      framesAnalyzed,
      audioAnalyzed,
      socialLinkDetected
    },
    scores: {
      baseScore,
      frameScore,
      transformationScore,
      consistencyScore
    },
    ...extra
  };
}
