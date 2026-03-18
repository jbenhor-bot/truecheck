import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Erro ao remover arquivo temporário:", error);
  }
}

function safeRemoveDir(dirPath) {
  try {
    if (dirPath && fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Erro ao remover diretório temporário:", error);
  }
}

function buildTempPaths(extension = ".mp4") {
  const id = crypto.randomUUID
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString("hex");

  const baseDir = path.join(os.tmpdir(), "truecheck-video");
  const workDir = path.join(baseDir, id);
  const inputPath = path.join(workDir, `input${extension}`);
  const framesDir = path.join(workDir, "frames");

  ensureDir(workDir);
  ensureDir(framesDir);

  return {
    id,
    workDir,
    inputPath,
    framesDir
  };
}

function normalizeExtension(fileName = "") {
  const ext = path.extname(String(fileName || "")).toLowerCase();

  if (!ext) return ".mp4";

  const allowed = [
    ".mp4",
    ".mov",
    ".avi",
    ".mkv",
    ".webm",
    ".m4v"
  ];

  return allowed.includes(ext) ? ext : ".mp4";
}

async function writeFileFromBlob(file, destinationPath) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(destinationPath, buffer);
}

export async function extractFrames({
  file,
  fileName = "",
  fps = 0.5,
  maxFrames = 12,
  width = 640
}) {
  let workDir = "";
  let inputPath = "";
  let framesDir = "";

  try {
    if (!file) {
      throw new Error("Nenhum arquivo de vídeo foi enviado para extração de frames.");
    }

    const extension = normalizeExtension(fileName || file?.name || "");
    const paths = buildTempPaths(extension);

    workDir = paths.workDir;
    inputPath = paths.inputPath;
    framesDir = paths.framesDir;

    await writeFileFromBlob(file, inputPath);

    const outputPattern = path.join(framesDir, "frame-%03d.jpg");

    const vfParts = [
      `fps=${fps}`,
      `scale='min(${width},iw)':-2`
    ];

    await execFileAsync("ffmpeg", [
      "-i",
      inputPath,
      "-vf",
      vfParts.join(","),
      "-q:v",
      "2",
      "-frames:v",
      String(maxFrames),
      outputPattern
    ]);

    const frameFiles = fs
      .readdirSync(framesDir)
      .filter((name) => name.toLowerCase().endsWith(".jpg"))
      .sort((a, b) => a.localeCompare(b));

    const frames = await Promise.all(
      frameFiles.map(async (name, index) => {
        const absolutePath = path.join(framesDir, name);
        const buffer = await fs.promises.readFile(absolutePath);

        return {
          index,
          fileName: name,
          path: absolutePath,
          buffer,
          base64: buffer.toString("base64")
        };
      })
    );

    return {
      ok: true,
      framesCount: frames.length,
      frames,
      cleanup: () => {
        safeRemoveDir(workDir);
      }
    };
  } catch (error) {
    safeRemoveDir(workDir);

    return {
      ok: false,
      framesCount: 0,
      frames: [],
      error: error.message || "Falha ao extrair frames do vídeo."
    };
  }
}

export async function cleanupExtractedFrames(result) {
  try {
    if (result?.frames?.length) {
      for (const frame of result.frames) {
        safeUnlink(frame.path);
      }
    }
  } catch (error) {
    console.error("Erro ao limpar frames:", error);
  }
}
