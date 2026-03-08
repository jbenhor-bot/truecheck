"use client";

import { useState } from "react";

function getConfidenceLabel(aiProbability, manipulationRisk) {
  const riskAverage = (aiProbability + manipulationRisk) / 2;
  if (riskAverage >= 70) return "Baixa";
  if (riskAverage >= 40) return "Média";
  return "Alta";
}

function getConfidenceColor(label) {
  if (label === "Baixa") return "#ef4444";
  if (label === "Média") return "#f59e0b";
  return "#22c55e";
}

function getAttentionLevel(score) {
  if (score >= 70) return "Alta";
  if (score >= 40) return "Média";
  return "Baixa";
}

function getAttentionColor(level) {
  if (level === "Alta") return "#ef4444";
  if (level === "Média") return "#f59e0b";
  return "#22c55e";
}

function ProgressBar({ label, value }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontSize: 14,
          fontWeight: 700,
          color: "#cbd5e1",
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div
        style={{
          width: "100%",
          height: 12,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "linear-gradient(90deg, #38bdf8, #6366f1)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        marginTop: 18,
        padding: 18,
        borderRadius: 18,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      {title && (
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 18,
            color: "#f8fafc",
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function Badge({ text, color }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "8px 12px",
        borderRadius: 999,
        fontWeight: 700,
        color,
        border: `1px solid ${color}`,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {text}
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState("");

  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState(null);
  const [textLoading, setTextLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageReport, setImageReport] = useState(null);
  const [imageMessage, setImageMessage] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [videoFrames, setVideoFrames] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);

  async function analyzeText() {
    if (!text.trim()) {
      setTextResult({
        classification: "Nenhum texto inserido",
        summary: "Cole um texto para iniciar a verificação.",
        recommendation: "Adicionar conteúdo para análise.",
      });
      return;
    }

    try {
      setTextLoading(true);

      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTextResult({
          classification: "Erro",
          summary: data.error || "Não foi possível analisar o texto.",
          recommendation: "Tente novamente.",
        });
        return;
      }

      setTextResult({
        classification: data.classification || "Análise recebida",
        summary: data.summary || "IA analisou o texto.",
        recommendation: data.recommendation || "Consultar fontes confiáveis.",
      });
    } catch (error) {
      setTextResult({
        classification: "Erro",
        summary: "Não foi possível conectar com a IA.",
        recommendation: "Tente novamente.",
      });
    } finally {
      setTextLoading(false);
    }
  }

  async function analyzeImage() {
    setImageReport(null);
    setImageMessage("");

    if (!imageFile && !imageUrl.trim()) {
      setImageMessage("Envie uma imagem ou cole a URL de uma imagem.");
      return;
    }

    try {
      setImageLoading(true);

      if (imageFile) {
        const fileName = imageFile.name.toLowerCase();
        const fileSizeMb = imageFile.size / (1024 * 1024);

        let aiProbability = 32;
        let manipulationRisk = 22;
        let observedSigns = [
          "Arquivo enviado para triagem inicial local.",
          "A análise completa por upload ainda será conectada ao backend.",
          "Recomenda-se complementar com contexto, fonte original e busca reversa.",
        ];

        if (
          fileName.includes("edited") ||
          fileName.includes("edit") ||
          fileName.includes("ai") ||
          fileName.includes("fake") ||
          fileName.includes("generated")
        ) {
          aiProbability = 74;
          manipulationRisk = 63;
          observedSigns = [
            "O nome do arquivo sugere possível edição, geração sintética ou manipulação.",
            "A imagem merece atenção reforçada antes de qualquer compartilhamento.",
            "O ideal é confirmar origem, data e contexto com fontes externas.",
          ];
        } else if (fileSizeMb > 4) {
          aiProbability = 41;
          manipulationRisk = 36;
          observedSigns = [
            "Arquivo com tamanho suficiente para preservar mais detalhes visuais.",
            "A imagem pode ser comparada com versões antigas ou publicações anteriores.",
            "A triagem atual é apenas inicial e não substitui uma perícia completa.",
          ];
        }

        const confidenceLabel = getConfidenceLabel(aiProbability, manipulationRisk);

        setImageReport({
          sourceType: "Arquivo enviado pelo usuário",
          aiProbability,
          manipulationRisk,
          observedSigns,
          recommendation:
            "Esta é uma triagem inicial local. O próximo passo do TrueCheck será enviar o arquivo ao backend para uma análise mais robusta.",
          confidenceLabel,
        });
        return;
      }

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setImageMessage(data.error || "Erro ao analisar a imagem.");
        return;
      }

      const confidenceLabel = getConfidenceLabel(
        data.aiProbability,
        data.manipulationRisk
      );

      setImageReport({
        sourceType: data.sourceType,
        aiProbability: data.aiProbability,
        manipulationRisk: data.manipulationRisk,
        observedSigns: data.observedSigns,
        recommendation: data.recommendation,
        confidenceLabel,
      });
    } catch (error) {
      setImageMessage("Erro de conexão ao analisar a imagem.");
    } finally {
      setImageLoading(false);
    }
  }

  function openReverseSearch() {
    if (!imageUrl.trim()) {
      setImageMessage(
        "Para busca na internet, use uma URL de imagem. Depois podemos ampliar isso para arquivo enviado."
      );
      return;
    }

    const encodedUrl = encodeURIComponent(imageUrl.trim());
    const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
    window.open(googleLensUrl, "_blank");
  }

  function captureFrame(video, canvas, timeInSeconds) {
    return new Promise((resolve) => {
      const handleSeeked = () => {
        const context = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameUrl = canvas.toDataURL("image/jpeg", 0.8);
        resolve(frameUrl);
      };

      video.currentTime = Math.min(
        Math.max(timeInSeconds, 0),
        Math.max(video.duration - 0.1, 0)
      );
      video.addEventListener("seeked", handleSeeked, { once: true });
    });
  }

  async function extractVideoFrames(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const objectUrl = URL.createObjectURL(file);

      video.preload = "metadata";
      video.src = objectUrl;
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration || 1;
          const captureTimes = [duration * 0.2, duration * 0.5, duration * 0.8];
          const frames = [];

          for (const time of captureTimes) {
            const frame = await captureFrame(video, canvas, time);
            frames.push(frame);
          }

          URL.revokeObjectURL(objectUrl);
          resolve({ duration, frames });
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Erro ao carregar vídeo."));
      };
    });
  }

  async function analyzeVideo() {
    if (!videoFile) {
      setVideoResult({
        classification: "Nenhum vídeo selecionado.",
        attentionLevel: "Baixa",
        attentionScore: 0,
        fileName: "-",
        fileSize: "0 MB",
        duration: "-",
        observation: "Selecione um vídeo para iniciar a triagem.",
        frameReadings: [
          "Sem frames disponíveis para leitura.",
          "Envie um vídeo para gerar a análise inicial.",
          "A triagem visual depende da extração automática dos frames.",
        ],
        detectedSigns: ["Sem arquivo enviado para análise inicial."],
        recommendation: "Envie um vídeo MP4 para iniciar a triagem automática.",
        nextStep: "Enviar um vídeo para continuar.",
      });
      setVideoFrames([]);
      return;
    }

    try {
      setVideoLoading(true);
      setVideoFrames([]);

      const extracted = await extractVideoFrames(videoFile);

      const fileName = videoFile.name;
      const fileSize = videoFile.size;
      const fileSizeMb = (fileSize / (1024 * 1024)).toFixed(2);
      const durationSeconds = extracted.duration.toFixed(2);

      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          fileSize,
          duration: extracted.duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setVideoResult({
          classification: "Erro ao analisar o vídeo.",
          attentionLevel: "Média",
          attentionScore: 45,
          fileName,
          fileSize: `${fileSizeMb} MB`,
          duration: `${durationSeconds} s`,
          observation: data.error || "Não foi possível concluir a análise.",
          frameReadings: [
            "Os frames foram extraídos, mas a API não respondeu como esperado.",
            "Tente novamente com outro arquivo ou revise a rota da API.",
            "A análise ainda pode ser aprimorada no backend.",
          ],
          detectedSigns: ["Falha na comunicação com a API de vídeo."],
          recommendation: "Revisar a API e tentar novamente.",
          nextStep: "Corrigir a integração entre frontend e backend.",
        });
        return;
      }

      const attentionLevel = getAttentionLevel(data.attentionScore || 0);

      setVideoFrames(extracted.frames);
      setVideoResult({
        classification: data.classification,
        attentionLevel,
        attentionScore: data.attentionScore,
        fileName,
        fileSize: `${fileSizeMb} MB`,
        duration: `${durationSeconds} s`,
        observation: data.observation,
        frameReadings: [
          "Frame 1: use para observar rosto, fundo e nitidez.",
          "Frame 2: bom ponto intermediário para comparar continuidade visual.",
          "Frame 3: útil para verificar mudanças bruscas entre cenas.",
        ],
        detectedSigns: data.detectedSigns || [],
        recommendation: data.recommendation,
        nextStep: data.nextStep,
      });
    } catch (error) {
      setVideoResult({
        classification: "Não foi possível extrair ou analisar o vídeo.",
        attentionLevel: "Média",
        attentionScore: 45,
        fileName: videoFile.name,
        fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: "-",
        observation:
          "O navegador ou a API encontrou dificuldade para processar esse arquivo.",
        frameReadings: [
          "Não foi possível gerar a leitura completa dos frames.",
          "O formato ou a codificação podem exigir tratamento adicional.",
          "Tente um arquivo MP4 simples para validar o fluxo.",
        ],
        detectedSigns: [
          "Falha na leitura automática ou na comunicação com a API.",
          "Formato ou codificação podem exigir tratamento adicional.",
        ],
        recommendation:
          "Tentar outro vídeo MP4 ou ampliar o processamento no backend.",
        nextStep:
          "Validar outro arquivo e revisar a integração da API de vídeo.",
      });
      setVideoFrames([]);
    } finally {
      setVideoLoading(false);
    }
  }

  function resetAll() {
    setMode("");
    setText("");
    setTextResult(null);
    setTextLoading(false);

    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    setImageLoading(false);
    setImageReport(null);
    setImageMessage("");

    setVideoFile(null);
    setVideoResult(null);
    setVideoFrames([]);
    setVideoLoading(false);
  }

  const pageStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top, #1e293b 0%, #0f172a 45%, #020617 100%)",
    fontFamily: "Arial, sans-serif",
    padding: 20,
    color: "#e2e8f0",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: 920,
    background: "rgba(15,23,42,0.82)",
    padding: 28,
    borderRadius: 28,
    boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
  };

  const btnPrimary = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    fontWeight: 700,
    background: "linear-gradient(135deg, #38bdf8, #6366f1)",
    color: "white",
    boxShadow: "0 10px 25px rgba(59,130,246,0.25)",
  };

  const btnSecondary = {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    cursor: "pointer",
    fontWeight: 700,
    color: "#e2e8f0",
  };

  const inputStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#f8fafc",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src="/logo.png"
                alt="Logo TrueCheck"
                style={{
                  height: 56,
                  width: "auto",
                  display: "block",
                  borderRadius: 8,
                }}
              />
              <h1 style={{ margin: 0, fontSize: 44, color: "#f8fafc" }}>
                TrueCheck
              </h1>
            </div>

            <p
              style={{
                marginTop: 10,
                color: "#94a3b8",
                lineHeight: 1.7,
                maxWidth: 620,
              }}
            >
              Segurança e verificação de conteúdo
            </p>
          </div>

          <button onClick={resetAll} style={btnSecondary}>
            Início
          </button>
        </div>

        {!mode && (
          <SectionCard title="Escolha o tipo de verificação">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={() => setMode("text")} style={btnPrimary}>
                Verificar Texto
              </button>
              <button onClick={() => setMode("image")} style={btnPrimary}>
                Verificar Imagem
              </button>
              <button onClick={() => setMode("video")} style={btnPrimary}>
                Verificar Vídeo
              </button>
            </div>

            <p
              style={{
                marginTop: 16,
                marginBottom: 0,
                fontSize: 14,
                color: "#94a3b8",
              }}
            >
              Começaremos com análises iniciais e depois conectaremos IA, fontes
              externas e verificações mais profundas.
            </p>
          </SectionCard>
        )}

        {mode === "text" && (
          <SectionCard title="Verificar Texto">
            <p style={{ color: "#94a3b8", marginTop: 0, lineHeight: 1.6 }}>
              Cole um texto, notícia ou declaração para receber uma análise
              inicial com IA.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui a notícia ou texto..."
              rows={8}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <button onClick={analyzeText} style={btnPrimary}>
                {textLoading ? "Analisando..." : "Verificar"}
              </button>

              <button
                onClick={() => {
                  setText("");
                  setTextResult(null);
                }}
                style={btnSecondary}
              >
                Limpar
              </button>
            </div>

            {textResult && (
              <SectionCard title="Resultado da verificação">
                <div style={{ lineHeight: 1.8 }}>
                  <div>
                    <b>Classificação:</b> {textResult.classification}
                  </div>
                  <div>
                    <b>Análise:</b> {textResult.summary}
                  </div>
                  <div>
                    <b>Recomendação:</b> {textResult.recommendation}
                  </div>
                </div>
              </SectionCard>
            )}
          </SectionCard>
        )}

        {mode === "image" && (
          <SectionCard title="Verificar Imagem">
            <p style={{ color: "#94a3b8", marginTop: 0, lineHeight: 1.6 }}>
              Envie uma imagem ou cole a URL para analisar indícios de
              <b> geração por IA </b>e <b>manipulação digital</b>.
            </p>

            <SectionCard title="Entrada da imagem">
              <div
                style={{ fontWeight: 700, marginBottom: 10, color: "#e2e8f0" }}
              >
                Enviar imagem
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImageFile(file || null);
                  setImageReport(null);
                  setImageMessage("");

                  if (file) {
                    const localUrl = URL.createObjectURL(file);
                    setImagePreview(localUrl);
                  } else {
                    setImagePreview("");
                  }
                }}
                style={{ color: "#cbd5e1" }}
              />

              <div
                style={{
                  marginTop: 16,
                  marginBottom: 10,
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                ou cole a URL da imagem
              </div>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageReport(null);
                  setImageMessage("");
                  if (e.target.value.trim()) {
                    setImagePreview(e.target.value.trim());
                  } else if (!imageFile) {
                    setImagePreview("");
                  }
                }}
                placeholder="https://exemplo.com/minha-imagem.jpg"
                style={inputStyle}
              />
            </SectionCard>

            {imagePreview && (
              <SectionCard title="Prévia da imagem">
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.03)",
                    padding: 12,
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Prévia da imagem"
                    style={{
                      width: "100%",
                      maxHeight: 380,
                      objectFit: "contain",
                      borderRadius: 12,
                      display: "block",
                    }}
                  />
                </div>
              </SectionCard>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <button onClick={analyzeImage} style={btnPrimary}>
                {imageLoading ? "Analisando..." : "Analisar Imagem"}
              </button>

              <button onClick={openReverseSearch} style={btnSecondary}>
                Buscar na internet
              </button>

              <button
                onClick={() => {
                  setImageFile(null);
                  setImageUrl("");
                  setImagePreview("");
                  setImageReport(null);
                  setImageMessage("");
                  setImageLoading(false);
                }}
                style={btnSecondary}
              >
                Limpar
              </button>
            </div>

            {imageMessage && (
              <SectionCard title="Mensagem">
                <div style={{ lineHeight: 1.7 }}>{imageMessage}</div>
              </SectionCard>
            )}

            {imageReport && (
              <SectionCard title="Resultado da verificação">
                <Badge
                  text={`Confiabilidade da imagem: ${imageReport.confidenceLabel}`}
                  color={getConfidenceColor(imageReport.confidenceLabel)}
                />

                <div style={{ marginTop: 14 }}>
                  <ProgressBar
                    label="Probabilidade de geração por IA"
                    value={imageReport.aiProbability}
                  />
                  <ProgressBar
                    label="Risco de manipulação/edição"
                    value={imageReport.manipulationRisk}
                  />
                </div>

                <SectionCard title="Sinais detectados">
                  <ul style={{ marginTop: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    {imageReport.observedSigns.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title="Contexto e verificação">
                  <div style={{ lineHeight: 1.8 }}>
                    <div>
                      Origem analisada: <b>{imageReport.sourceType}</b>
                    </div>
                    <div>
                      Busca reversa disponível para investigação complementar.
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Recomendação">
                  <div style={{ lineHeight: 1.8 }}>
                    {imageReport.recommendation}
                  </div>
                </SectionCard>
              </SectionCard>
            )}
          </SectionCard>
        )}

        {mode === "video" && (
          <SectionCard title="Verificar Vídeo">
            <p style={{ color: "#94a3b8", marginTop: 0, lineHeight: 1.6 }}>
              Envie um vídeo para triagem inicial de <b>deepfake</b>, edição ou
              manipulação.
            </p>

            <SectionCard title="Entrada do vídeo">
              <div
                style={{ fontWeight: 700, marginBottom: 10, color: "#e2e8f0" }}
              >
                Enviar vídeo
              </div>

              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setVideoFile(file || null);
                  setVideoResult(null);
                  setVideoFrames([]);
                }}
                style={{ color: "#cbd5e1" }}
              />
            </SectionCard>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 14,
                flexWrap: "wrap",
              }}
            >
              <button onClick={analyzeVideo} style={btnPrimary}>
                {videoLoading ? "Extraindo frames..." : "Analisar Vídeo"}
              </button>

              <button
                onClick={() => {
                  setVideoFile(null);
                  setVideoResult(null);
                  setVideoFrames([]);
                  setVideoLoading(false);
                }}
                style={btnSecondary}
              >
                Limpar
              </button>
            </div>

            {videoFrames.length > 0 && (
              <SectionCard title="Frames extraídos automaticamente">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {videoFrames.map((frame, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                        padding: 10,
                        background: "rgba(255,255,255,0.03)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 8,
                          color: "#cbd5e1",
                        }}
                      >
                        Frame {index + 1}
                      </div>
                      <img
                        src={frame}
                        alt={`Frame ${index + 1}`}
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          display: "block",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {videoResult && (
              <SectionCard title="Resultado da verificação">
                <Badge
                  text={`Nível de atenção do vídeo: ${videoResult.attentionLevel}`}
                  color={getAttentionColor(videoResult.attentionLevel)}
                />

                <div style={{ marginTop: 14 }}>
                  <ProgressBar
                    label="Pontuação inicial de risco"
                    value={videoResult.attentionScore}
                  />
                </div>

                <SectionCard title="Resumo">
                  <div style={{ lineHeight: 1.8 }}>
                    <div>
                      <b>Classificação:</b> {videoResult.classification}
                    </div>
                    <div>
                      <b>Arquivo:</b> {videoResult.fileName}
                    </div>
                    <div>
                      <b>Tamanho:</b> {videoResult.fileSize}
                    </div>
                    <div>
                      <b>Duração estimada:</b> {videoResult.duration}
                    </div>
                    <div>
                      <b>Observação:</b> {videoResult.observation}
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Leitura inicial dos frames">
                  <ul style={{ marginTop: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    {videoResult.frameReadings.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title="Sinais detectados">
                  <ul style={{ marginTop: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    {videoResult.detectedSigns.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </SectionCard>

                <SectionCard title="Recomendação">
                  <div style={{ lineHeight: 1.8 }}>
                    {videoResult.recommendation}
                  </div>
                </SectionCard>

                <SectionCard title="Próximo passo">
                  <div style={{ lineHeight: 1.8 }}>{videoResult.nextStep}</div>
                </SectionCard>
              </SectionCard>
            )}
          </SectionCard>
        )}
      </div>
    </main>
  );
}
