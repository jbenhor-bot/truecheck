import sharp from "sharp";

function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values) {
  if (!values.length) return 0;

  const avg = average(values);
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) /
    values.length;

  return Math.sqrt(variance);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildVerdict(score) {
  if (score >= 70) return "Alta suspeita de IA";
  if (score >= 40) return "Suspeita moderada";
  return "Baixa suspeita";
}

async function getNormalizedImageData(imageBuffer) {
  const { data, info } = await sharp(imageBuffer)
    .resize(256, 256, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels
  };
}

function analyzeTexture(luminances) {
  const textureStd = std(luminances);

  let score = 0;
  const notes = [];

  if (textureStd < 18) {
    score += 25;
    notes.push("Suavização artificial forte");
  } else if (textureStd < 25) {
    score += 15;
    notes.push("Textura muito uniforme");
  } else if (textureStd < 32) {
    score += 6;
    notes.push("Baixa variação natural de textura");
  }

  return {
    textureStd: Number(textureStd.toFixed(2)),
    score,
    notes
  };
}

function analyzeEdges(data, width, height, channels) {
  const gradients = [];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idx = (y * width + x) * channels;
      const rightIdx = (y * width + (x + 1)) * channels;
      const downIdx = ((y + 1) * width + x) * channels;

      const lum = getLuminance(data[idx], data[idx + 1], data[idx + 2]);
      const lumRight = getLuminance(
        data[rightIdx],
        data[rightIdx + 1],
        data[rightIdx + 2]
      );
      const lumDown = getLuminance(
        data[downIdx],
        data[downIdx + 1],
        data[downIdx + 2]
      );

      const gx = Math.abs(lum - lumRight);
      const gy = Math.abs(lum - lumDown);

      gradients.push((gx + gy) / 2);
    }
  }

  const avgGradient = average(gradients);
  const gradientStd = std(gradients);

  let score = 0;
  const notes = [];

  if (avgGradient > 30 && gradientStd < 18) {
    score += 15;
    notes.push("Bordas com comportamento artificial");
  } else if (avgGradient > 24 && gradientStd < 22) {
    score += 8;
    notes.push("Nitidez incomum em regiões da imagem");
  }

  return {
    avgGradient: Number(avgGradient.toFixed(2)),
    gradientStd: Number(gradientStd.toFixed(2)),
    score,
    notes
  };
}

function analyzeRepetition(data, width, height, channels) {
  const blockSize = 8;
  const blockMeans = [];

  for (let by = 0; by <= height - blockSize; by += blockSize) {
    for (let bx = 0; bx <= width - blockSize; bx += blockSize) {
      const values = [];

      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const idx = ((by + y) * width + (bx + x)) * channels;
          const lum = getLuminance(data[idx], data[idx + 1], data[idx + 2]);
          values.push(lum);
        }
      }

      blockMeans.push(Math.round(average(values)));
    }
  }

  const counts = {};

  for (const mean of blockMeans) {
    counts[mean] = (counts[mean] || 0) + 1;
  }

  const repeatedBuckets = Object.values(counts).filter((count) => count >= 6).length;
  const repetitionRatio =
    blockMeans.length > 0 ? repeatedBuckets / blockMeans.length : 0;

  let score = 0;
  const notes = [];

  if (repetitionRatio > 0.12) {
    score += 15;
    notes.push("Padrões repetitivos incomuns");
  } else if (repetitionRatio > 0.07) {
    score += 8;
    notes.push("Alguma repetição visual suspeita");
  }

  return {
    repetitionRatio: Number(repetitionRatio.toFixed(4)),
    score,
    notes
  };
}

async function analyzeCompression(imageBuffer) {
  const originalSize = imageBuffer.length;

  if (!originalSize) {
    return {
      compressionRatio: 1,
      score: 0,
      notes: []
    };
  }

  const recompressedBuffer = await sharp(imageBuffer)
    .jpeg({ quality: 85 })
    .toBuffer();

  const recompressedSize = recompressedBuffer.length;
  const compressionRatio = recompressedSize / originalSize;

  let score = 0;
  const notes = [];

  if (compressionRatio < 0.45) {
    score += 12;
    notes.push("Compressão inconsistente ou otimização excessiva");
  } else if (compressionRatio < 0.6) {
    score += 6;
    notes.push("Compressão possivelmente incomum");
  }

  return {
    compressionRatio: Number(compressionRatio.toFixed(4)),
    score,
    notes
  };
}

export async function analyzeVisual(imageBuffer, hasExif) {
  const { data, width, height, channels } = await getNormalizedImageData(imageBuffer);

  const luminances = [];

  for (let i = 0; i < data.length; i += channels) {
    luminances.push(getLuminance(data[i], data[i + 1], data[i + 2]));
  }

  const texture = analyzeTexture(luminances);
  const edges = analyzeEdges(data, width, height, channels);
  const repetition = analyzeRepetition(data, width, height, channels);
  const compression = await analyzeCompression(imageBuffer);

  let score = 0;
  const notes = [];

  if (!hasExif) {
    score += 20;
    notes.push("Imagem sem EXIF");
  }

  score += texture.score;
  score += edges.score;
  score += repetition.score;
  score += compression.score;

  notes.push(...texture.notes);
  notes.push(...edges.notes);
  notes.push(...repetition.notes);
  notes.push(...compression.notes);

  score = clamp(score, 0, 100);

  return {
    visualScore: score,
    verdict: buildVerdict(score),
    textureStd: texture.textureStd,
    metrics: {
      width,
      height,
      avgGradient: edges.avgGradient,
      gradientStd: edges.gradientStd,
      repetitionRatio: repetition.repetitionRatio,
      compressionRatio: compression.compressionRatio
    },
    notes
  };
}
