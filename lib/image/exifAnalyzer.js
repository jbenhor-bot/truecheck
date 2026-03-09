import * as exifr from "exifr";

export async function analyzeExif(file) {
  try {
    // converte o arquivo em ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // lê os metadados EXIF
    const metadata = await exifr.parse(arrayBuffer, {
      tiff: true,
      ifd0: true,
      exif: true,
      gps: true
    });

    // se não houver EXIF
    if (!metadata) {
      return {
        hasExif: false,
        exifScore: 15,
        exifSignals: [
          "Nenhum metadado EXIF encontrado"
        ],
        exifData: null
      };
    }

    const signals = [];
    let score = 0;

    // câmera ou dispositivo
    if (metadata.Make || metadata.Model) {
      signals.push(
        `Dispositivo identificado: ${[metadata.Make, metadata.Model]
          .filter(Boolean)
          .join(" ")}`
      );
      score -= 5;
    }

    // software usado
    if (metadata.Software) {
      signals.push(`Software detectado: ${metadata.Software}`);
      score += 25;
    }

    // data da foto
    if (metadata.DateTimeOriginal || metadata.CreateDate) {
      signals.push("Data original da imagem encontrada");
      score -= 5;
    }

    // GPS
    if (metadata.latitude && metadata.longitude) {
      signals.push("Coordenadas GPS presentes");
      score -= 5;
    }

    return {
      hasExif: true,
      exifScore: Math.max(0, score),
      exifSignals: signals.length > 0 ? signals : ["Metadados EXIF presentes"],
      exifData: {
        make: metadata.Make || null,
        model: metadata.Model || null,
        software: metadata.Software || null,
        dateTimeOriginal:
          metadata.DateTimeOriginal || metadata.CreateDate || null,
        latitude: metadata.latitude || null,
        longitude: metadata.longitude || null
      }
    };
  } catch (error) {
    return {
      hasExif: false,
      exifScore: 10,
      exifSignals: [
        "Não foi possível ler os metadados EXIF"
      ],
      exifData: null
    };
  }
}
