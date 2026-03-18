export function normalizeVideoScore({
  baseScore = 0,
  frameScore = 0,
  transformationScore = 0,
  consistencyScore = 0
}) {
  let finalScore = Number(baseScore || 0);

  if (frameScore > 0) {
    finalScore += frameScore * 0.4;
  }

  if (transformationScore > 0) {
    finalScore += transformationScore * 0.45;
  }

  if (consistencyScore > 0) {
    finalScore += consistencyScore * 0.2;
  }

  // bônus por convergência de sinais
  if (frameScore >= 70 && transformationScore >= 80) {
    finalScore += 12;
  }

  if (baseScore >= 60 && transformationScore >= 80) {
    finalScore += 8;
  }

  if (frameScore >= 75 && consistencyScore >= 60) {
    finalScore += 6;
  }

  if (finalScore < 0) return 0;
  if (finalScore > 100) return 100;

  return Math.round(finalScore);
}

export function getAttentionLevel(score) {
  if (score >= 76) return "alto";
  if (score >= 46) return "médio";
  return "baixo";
}

export function getClassification(score, context = {}) {
  const {
    hasStrongSyntheticEvidence = false,
    hasTransformationEvidence = false,
    framesAnalyzed = false
  } = context;

  if (hasStrongSyntheticEvidence && hasTransformationEvidence && score >= 90) {
    return "forte evidência de conteúdo sintético ou transformação artificial";
  }

  if (hasTransformationEvidence && score >= 85) {
    return "forte suspeita de transformação visual artificial";
  }

  if (hasStrongSyntheticEvidence && score >= 85) {
    return "forte evidência de geração sintética";
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
    hasStrongSyntheticEvidence = false,
    hasTransformationEvidence = false
  } = context;

  if (hasStrongSyntheticEvidence && hasTransformationEvidence && framesAnalyzed) {
    return "Evite compartilhar como conteúdo autêntico. Há sinais fortes e convergentes de conteúdo sintético ou transformação visual artificial.";
  }

  if (hasStrongSyntheticEvidence && framesAnalyzed) {
    return "Evite compartilhar como conteúdo autêntico. Há indícios fortes de geração sintética e os frames reforçam a suspeita.";
  }

  if (hasTransformationEvidence && framesAnalyzed) {
    return "O conteúdo apresenta fortes sinais de transformação visual artificial. Trate como suspeito até validação técnica complementar.";
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
    hasStrongSyntheticEvidence,
    hasTransformationEvidence
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
    flags: {
      hasStrongSyntheticEvidence,
      hasTransformationEvidence
    },
    ...extra
  };
}
