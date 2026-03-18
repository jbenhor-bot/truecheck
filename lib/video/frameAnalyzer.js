import sharp from "sharp";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function stdDev(values = []) {
  if (!values.length) return 0;
  const avg = average(values);
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

async function getRawLumaSamples(buffer) {
  const resized = await sharp(buffer)
    .resize(160, 160, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const { width, height, channels } = info;

  const luma = [];
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    luma.push(y);
  }

  return {
    luma,
    width,
    height
  };
}

function computeNeighborDiffs(luma, width, height) {
  const diffs = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const current = luma[index];

      if (x + 1 < width) {
        const right = luma[index + 1];
        diffs.push(Math.abs(current - right));
      }

      if (y + 1 < height) {
        const bottom = luma[index + width];
        diffs.push(Math.abs(current - bottom));
      }
    }
  }

  return diffs;
}

function buildFrameSignals(metrics) {
  const signals = [];
  const {
    sharpnessScore,
    textureScore,
    entropy,
    contrastDeviation,
    brightnessMean
  } = metrics;

  if (sharpnessScore < 18) {
    signals.push("frame com suavização elevada e baixa definição natural");
  }

  if (textureScore < 16) {
    signals.push("textura visual reduzida, possível aparência plástica/artificial");
  }

  if (entropy < 4.2) {
    signals.push("baixa complexidade visual no frame");
  }

  if (contrastDeviation < 22) {
    signals.push("variação tonal limitada para cena natural");
  }

  if (brightnessMean > 210) {
    signals.push("luminosidade excessiva com aparência possivelmente sintética");
  }

  if (brightnessMean < 35) {
    signals.push("frame muito escuro, análise visual parcialmente limitada");
  }

  return signals;
}

function scoreFrame(metrics) {
  const {
    sharpnessScore,
    textureScore,
    entropy,
    contrastDeviation,
    brightnessMean
  } = metrics;

  let score = 0;

  if (sharpnessScore < 14) score += 22;
  else if (sharpnessScore < 20) score += 14;
  else if (sharpnessScore < 28) score += 6;

  if (textureScore < 12) score += 22;
  else if (textureScore < 18) score += 12;
  else if (textureScore < 24) score += 5;

  if (entropy < 3.8) score += 18;
  else if (entropy < 4.4) score += 10;
  else if (entropy < 5.0) score += 4;

  if (contrastDeviation < 18) score += 14;
  else if (contrastDeviation < 24) score += 8;

  if (brightnessMean > 220 || brightnessMean < 28) {
    score += 6;
  }

  if (sharpnessScore < 18 && textureScore < 16) {
    score += 10;
  }

  if (entropy < 4.2 && contrastDeviation < 22) {
    score += 8;
  }

  return clamp(Math.round(score));
}

async function analyzeSingleFrame(frame) {
  const image = sharp(frame.buffer);
  const stats = await image.stats();
  const metadata = await image.metadata();
  const { luma, width, height } = await getRawLumaSamples(frame.buffer);

  const diffs = computeNeighborDiffs(luma, width, height);

  const brightnessMean = average(luma);
  const contrastDeviation = stdDev(luma);
  const sharpnessScore = average(diffs);
  const textureScore = stdDev(diffs);

  const entropy =
    typeof stats.entropy === "number"
      ? stats.entropy
      : average(
          (stats.channels || []).map((channel) =>
            typeof channel.entropy === "number" ? channel.entropy : 0
          )
        );

  const metrics = {
    width: metadata.width || width,
    height: metadata.height || height,
    brightnessMean,
    contrastDeviation,
    sharpnessScore,
    textureScore,
    entropy
  };

  const score = scoreFrame(metrics);
  const signals = buildFrameSignals(metrics);

  return {
    index: frame.index,
    score,
    signals,
    metrics
  };
}

export async function analyzeFrames(frames = []) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return {
      score: 0,
      signals: ["nenhum frame disponível para análise"],
      analyzedFrames: 0,
      suspiciousFrames: 0,
      highlySuspiciousFrames: 0,
      frameDetails: []
    };
  }

  const frameDetails = [];

  for (const frame of frames) {
    try {
      const result = await analyzeSingleFrame(frame);
      frameDetails.push(result);
    } catch (error) {
      frameDetails.push({
        index: frame?.index ?? frameDetails.length,
        score: 0,
        signals: ["falha ao analisar este frame"],
        metrics: {}
      });
    }
  }

  const scores = frameDetails.map((item) => item.score);
  const avgScore = average(scores);
  const maxScore = Math.max(...scores, 0);
  const suspiciousFrames = frameDetails.filter((item) => item.score >= 35).length;
  const highlySuspiciousFrames = frameDetails.filter((item) => item.score >= 55).length;

  let finalScore = avgScore * 0.7 + maxScore * 0.3;

  if (suspiciousFrames >= 3) {
    finalScore += 8;
  }

  if (highlySuspiciousFrames >= 2) {
    finalScore += 10;
  }

  if (highlySuspiciousFrames >= 4) {
    finalScore += 8;
  }

  finalScore = clamp(Math.round(finalScore));

  const mergedSignals = [
    ...new Set(
      frameDetails
        .flatMap((item) => item.signals || [])
        .filter(Boolean)
        .map((item) => String(item).trim())
    )
  ];

  if (suspiciousFrames >= Math.max(2, Math.ceil(frames.length * 0.4))) {
    mergedSignals.push("múltiplos frames apresentam padrão visual suspeito");
  }

  if (highlySuspiciousFrames >= Math.max(2, Math.ceil(frames.length * 0.25))) {
    mergedSignals.push("há recorrência de artefatos compatíveis com síntese/manipulação");
  }

  return {
    score: clamp(finalScore),
    signals: [...new Set(mergedSignals)],
    analyzedFrames: frameDetails.length,
    suspiciousFrames,
    highlySuspiciousFrames,
    frameDetails
  };
}
