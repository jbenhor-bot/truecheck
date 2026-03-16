import sharp from "sharp";

function getLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function std(values) {
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export async function analyzeVisual(imageBuffer, hasExif) {
  const resized = await sharp(imageBuffer)
    .resize(256, 256, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const data = resized.data;
  const channels = resized.info.channels;

  const luminances = [];

  for (let i = 0; i < data.length; i += channels) {
    luminances.push(getLuminance(data[i], data[i + 1], data[i + 2]));
  }

  const textureStd = std(luminances);

  let score = 0;
  const notes = [];

  if (!hasExif) {
    score += 20;
    notes.push("Imagem sem EXIF");
  }

  if (textureStd < 25) {
    score += 20;
    notes.push("Textura muito uniforme (possível IA)");
  }

  if (textureStd < 18) {
    score += 10;
    notes.push("Suavização artificial forte");
  }

  if (score > 100) score = 100;

  let verdict = "Baixa suspeita";

  if (score >= 60) verdict = "Alta suspeita de IA";
  else if (score >= 30) verdict = "Suspeita moderada";

  return {
    visualScore: score,
    verdict,
    textureStd: Number(textureStd.toFixed(2)),
    notes,
  };
}
