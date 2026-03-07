"use client";

import { useMemo, useState } from "react";

function getConfidenceLabel(aiProbability, manipulationRisk) {
  const riskAverage = (aiProbability + manipulationRisk) / 2;

  if (riskAverage >= 70) return "Baixa";
  if (riskAverage >= 40) return "Média";
  return "Alta";
}

function getConfidenceColor(label) {
  if (label === "Baixa") return "#dc2626";
  if (label === "Média") return "#d97706";
  return "#16a34a";
}

function getAttentionLevel(score) {
  if (score >= 70) return "Alta";
  if (score >= 40) return "Média";
  return "Baixa";
}

function getAttentionColor(level) {
  if (level === "Alta") return "#dc2626";
  if (level === "Média") return "#d97706";
  return "#16a34a";
}

function ProgressBar({ label, value }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div
        style={{
          width: "100%",
          height: 12,
          background: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "#111827",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState("");

  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageReport, setImageReport] = useState(null);
  const [imageMessage, setImageMessage] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [videoResult, setVideoResult] = useState(null);
  const [videoFrames, setVideoFrames] = useState([]);
  const [videoLoading, setVideoLoading] = useState(false);

  const imagePreviewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (imageUrl.trim()) return imageUrl.trim();
    return "";
  }, [imageFile, imageUrl]);

  function resetAll() {
    setMode("");
    setText("");
    setTextResult(null);
    setImageFile(null);
    setImageUrl("");
    setImageLoading(false);
    setImageReport(null);
    setImageMessage("");
    setVideoFile(null);
    setVideoResult(null);
    setVideoFrames([]);
    setVideoLoading(false);
  }

  function analyzeText() {
    const conteudo = text.trim();

    if (!conteudo) {
      setTextResult({
        status: "empty",
        classification: "Nenhum texto inserido.",
        size: 0,
        sentences: 0,
        observation: "Cole um texto para iniciar a análise.",
        nextStep: "Adicionar conteúdo para triagem inicial.",
      });
      return;
    }

    const textoLower = conteudo.toLowerCase();
    const tamanho = conteudo.length;
    const frases = conteudo
      .split(/[.!?]+/)
      .filter((frase) => frase.trim() !== "").length;

    const palavrasForte = [
      "confirmado",
      "prova",
      "comprovado",
      "garante",
      "certeza",
      "denúncia",
      "fraude",
      "crime",
      "narcoterrorismo",
      "militares",
      "governo",
      "ataque",
      "ordem",
      "investigação",
      "guerra",
      "israel",
      "irã",
      "trump",
    ];

    const palavrasOpiniao = [
      "acho",
      "opinião",
      "parece",
      "talvez",
      "acredito",
      "imagino",
      "sinto",
    ];

    let encontrouFato = false;
    let encontrouOpiniao = false;

    for (const palavra of palavrasForte) {
      if (textoLower.includes(palavra)) {
        encontrouFato = true;
        break;
      }
    }

    for (const palavra of palavrasOpiniao) {
      if (textoLower.includes(palavra)) {
        encontrouOpiniao = true;
        break;
      }
    }

    let classification = "";
    let observation = "";
    let nextStep = "";

    if (tamanho < 40) {
      classification = "Texto muito curto para análise inicial.";
      observation =
        "Há pouco conteúdo para identificar uma afirmação verificável.";
      nextStep =
        "Adicionar mais contexto, nomes, local, data ou descrição do fato.";
    } else if (encontrouOpiniao && !encontrouFato) {
      classification = "Conteúdo com traços de opinião.";
      observation = "O texto parece mais opinativo do que factual.";
      nextStep = "Separar opinião de afirmações que possam ser checadas.";
    } else if (encontrouFato || frases >= 2) {
      classification = "Possível afirmação verificável detectada.";
      observation =
        "O texto contém elementos que podem ser conferidos em fontes externas.";
      nextStep = "Próximo passo: checagem real com IA e fontes confiáveis.";
    } else {
      classification = "Conteúdo recebido para triagem inicial.";
      observation =
        "O sistema identificou texto suficiente para análise preliminar.";
      nextStep = "Aprofundar a checagem com contexto e fontes.";
    }

    setTextResult({
      status: "ok",
      classification,
      size: tamanho,
      sentences: frases,
      observation,
      nextStep,
    });
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

        let aiProbability = 24;
        let manipulationRisk = 18;
        let observedSigns = [
          "Ausência de metadados completos no fluxo atual.",
          "Análise ainda preliminar baseada no arquivo enviado.",
          "Recomendado complementar com busca reversa e contexto.",
        ];

        if (
          fileName.includes("edited") ||
          fileName.includes("edit") ||
          fileName.includes("ai") ||
          fileName.includes("fake") ||
          fileName.includes("generated")
        ) {
          aiProbability = 68;
          manipulationRisk = 61;
          observedSigns = [
            "Nome do arquivo sugere possível edição ou geração.",
            "Necessária checagem adicional de origem e contexto.",
            "Buscar confirmação em fontes externas antes de concluir.",
          ];
        } else if (fileSizeMb > 4) {
          aiProbability = 39;
          manipulationRisk = 34;
          observedSigns = [
            "Arquivo grande o suficiente para preservar muitos detalhes.",
            "É útil comparar versões e verificar contexto de publicação.",
            "A inspeção visual inicial não basta para confirmação final.",
          ];
        }

        const confidenceLabel = getConfidenceLabel(
          aiProbability,
          manipulationRisk
        );

        setImageReport({
          sourceType: "Arquivo enviado",
          aiProbability,
          manipulationRisk,
          observedSigns,
          recommendation:
            "Use esta análise como triagem inicial. O próximo passo ideal é combinar busca reversa, contexto de publicação e verificação com fontes confiáveis.",
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
        "Para busca na internet, use uma URL de imagem. O próximo passo será suportar melhor essa função para arquivo enviado."
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
          const captureTimes = [
            duration * 0.2,
            duration * 0.5,
            duration * 0.8,
          ];

          const frames = [];

          for (const time of captureTimes) {
            const frame = await captureFrame(video, canvas, time);
            frames.push(frame);
          }

          URL.revokeObjectURL(objectUrl);
          resolve({
            duration,
            frames,
          });
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
        recommendation:
          "Envie um vídeo MP4 para iniciar a triagem automática.",
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
      const lowerName = fileName.toLowerCase();
      const fileSizeMb = (videoFile.size / (1024 * 1024)).toFixed(2);
      const durationSeconds = extracted.duration.toFixed(2);

      let attentionScore = 28;
      let classification = "Vídeo recebido para triagem inicial.";
      let observation =
        "Frames automáticos foram extraídos para inspeção visual preliminar.";
      let frameReadings = [
        "Frame 1: imagem disponível para checar fundo, iluminação e nitidez.",
        "Frame 2: bom ponto intermediário para observar continuidade visual.",
        "Frame 3: útil para comparar mudanças bruscas entre começo e fim.",
      ];
      let detectedSigns = [
        "Frames capturados em diferentes momentos do vídeo.",
        "Próxima etapa recomendada: comparar rosto, fundo, cortes e consistência visual.",
        "Necessária checagem de origem, contexto e publicação.",
      ];
      let recommendation =
        "Use os frames extraídos como triagem inicial. O ideal é complementar com análise mais profunda de cortes, sincronização facial e contexto da publicação.";
      let nextStep =
        "Próximo passo: analisar frames, áudio e sinais de manipulação/deepfake.";

      if (
        lowerName.includes("deepfake") ||
        lowerName.includes("fake") ||
        lowerName.includes("ai") ||
        lowerName.includes("edited")
      ) {
        attentionScore = 78;
        classification = "Vídeo com indícios que merecem atenção reforçada.";
        observation =
          "O nome do arquivo sugere possível edição, geração sintética ou manipulação.";
        frameReadings = [
          "Frame 1: observar contornos faciais e fusão com o fundo.",
          "Frame 2: verificar consistência de pele, sombras e olhos.",
          "Frame 3: procurar mudanças estranhas entre cenas e detalhes do rosto.",
        ];
        detectedSigns = [
          "Nome do arquivo sugere possível conteúdo manipulado.",
          "Frames automáticos já estão prontos para inspeção visual.",
          "Análise aprofundada deve incluir sincronização facial e consistência entre cenas.",
        ];
        recommendation =
          "Dar prioridade à checagem de autenticidade, com comparação quadro a quadro e validação da origem.";
        nextStep =
          "Próximo passo: rodar análise aprofundada de frames e possíveis sinais de deepfake.";
      } else if (videoFile.size > 50 * 1024 * 1024) {
        attentionScore = 52;
        classification = "Vídeo grande recebido para análise técnica.";
        observation =
          "Arquivos maiores podem preservar mais detalhes úteis para investigação.";
        frameReadings = [
          "Frame 1: qualidade suficiente para examinar textura e compressão.",
          "Frame 2: permite observar continuidade entre partes do vídeo.",
          "Frame 3: ajuda a verificar se há variações estranhas de cena.",
        ];
        detectedSigns = [
          "Frames extraídos de um arquivo com mais detalhes visuais.",
          "Vale analisar compressão, cortes e continuidade entre cenas.",
          "Contexto de publicação continua sendo essencial.",
        ];
        recommendation =
          "Aproveitar a maior riqueza visual do arquivo para inspeção técnica detalhada.";
        nextStep =
          "Próximo passo: processar frames e examinar cortes, compressão e contexto.";
      } else if (extracted.duration > 20) {
        attentionScore = 46;
        classification = "Vídeo mais longo com necessidade de revisão gradual.";
        observation =
          "Vídeos mais longos podem esconder sinais de manipulação em trechos específicos.";
        frameReadings = [
          "Frame 1: útil para avaliar a abertura do vídeo.",
          "Frame 2: importante para revisar o trecho central.",
          "Frame 3: ajuda a comparar possíveis mudanças no encerramento.",
        ];
        detectedSigns = [
          "Duração maior pede checagem por trechos.",
          "Os 3 frames ajudam na triagem, mas não substituem revisão completa.",
          "É importante revisar também momentos fora dos frames extraídos.",
        ];
        recommendation =
          "Selecionar mais frames ao longo do vídeo para ampliar a cobertura da inspeção.";
        nextStep =
          "Próximo passo: extrair mais quadros e revisar trechos adicionais.";
      }

      const attentionLevel = getAttentionLevel(attentionScore);

      setVideoFrames(extracted.frames);

      setVideoResult({
        classification,
        attentionLevel,
        attentionScore,
        fileName,
        fileSize: `${fileSizeMb} MB`,
        duration: `${durationSeconds} s`,
        observation,
        frameReadings,
        detectedSigns,
        recommendation,
        nextStep,
      });
    } catch (error) {
      setVideoResult({
        classification: "Não foi possível extrair frames do vídeo.",
        attentionLevel: "Média",
        attentionScore: 45,
        fileName: videoFile.name,
        fileSize: `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`,
        duration: "-",
        observation:
          "O navegador encontrou dificuldade para processar esse arquivo no momento.",
        frameReadings: [
          "Não foi possível gerar a leitura dos frames.",
          "O formato ou a codificação podem exigir tratamento adicional.",
          "Tente um arquivo MP4 simples para validar o fluxo.",
        ],
        detectedSigns: [
          "Falha na leitura automática do vídeo.",
          "Formato ou codificação podem exigir tratamento adicional.",
        ],
        recommendation:
          "Tentar outro vídeo MP4 ou implementar processamento mais robusto no backend.",
        nextStep:
          "Tentar outro vídeo MP4 ou implementar análise de vídeo no servidor.",
      });
      setVideoFrames([]);
    } finally {
      setVideoLoading(false);
    }
  }

  const cardStyle = {
    width: "100%",
    maxWidth: 820,
    background: "white",
    padding: 26,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  };

  const btnPrimary = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    background: "#111827",
    color: "white",
  };

  const btnSecondary = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  };

  const sectionTitleStyle = {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 700,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
        padding: 18,
        color: "#111",
      }}
    >
      <div style={cardStyle}>
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 40 }}>TrueCheck</h1>
            <p style={{ marginTop: 8, color: "#444" }}>
              Escolha o tipo de verificação e receba uma análise inicial.
            </p>
          </div>

          <button onClick={resetAll} style={btnSecondary}>
            Início
          </button>
        </div>

        {!mode && (
          <>
            <p style={{ marginTop: 18, marginBottom: 10, fontWeight: 700 }}>
              Escolha o tipo de verificação
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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

            <p style={{ marginTop: 14, fontSize: 13, color: "#666" }}>
              Dica: começaremos com análises iniciais e depois conectamos IA +
              fontes.
            </p>
          </>
        )}

        {mode === "text" && (
          <>
            <h2 style={sectionTitleStyle}>Verificar Texto</h2>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui o texto ou notícia..."
              rows={8}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                resize: "vertical",
                fontSize: 15,
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={analyzeText} style={btnPrimary}>
                Verificar
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
              <div
                style={{
                  marginTop: 14,
                  padding: 16,
                  borderRadius: 12,
                  background: "#f5f7fb",
                  border: "1px solid #e7eaf3",
                  lineHeight: 1.7,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Resultado da análise
                </div>

                <div>
                  <b>Classificação:</b> {textResult.classification}
                </div>

                <div>
                  <b>Tamanho do texto:</b> {textResult.size} caracteres
                </div>

                <div>
                  <b>Frases identificadas:</b> {textResult.sentences}
                </div>

                <div>
                  <b>Observação:</b> {textResult.observation}
                </div>

                <div style={{ marginTop: 8 }}>
                  <b>Próximo passo:</b> {textResult.nextStep}
                </div>
              </div>
            )}
          </>
        )}

        {mode === "image" && (
          <>
            <h2 style={sectionTitleStyle}>Verificar Imagem</h2>

            <p style={{ marginTop: 0, color: "#444", lineHeight: 1.6 }}>
              Envie uma imagem ou cole a URL para analisar indícios de{" "}
              <b>geração por IA</b> e <b>manipulação digital</b>.
            </p>

            <div
              style={{
                marginTop: 12,
                border: "2px dashed #d1d5db",
                borderRadius: 16,
                padding: 18,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
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
                }}
              />

              <div style={{ marginTop: 14, fontWeight: 700 }}>
                ou cole a URL da imagem
              </div>

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageReport(null);
                  setImageMessage("");
                }}
                placeholder="https://exemplo.com/minha-imagem.jpg"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  fontSize: 15,
                  marginTop: 10,
                }}
              />
            </div>

            {imagePreviewUrl && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>
                  Prévia da imagem
                </div>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    background: "#fafafa",
                    padding: 12,
                  }}
                >
                  <img
                    src={imagePreviewUrl}
                    alt="Prévia da imagem"
                    style={{
                      width: "100%",
                      maxHeight: 360,
                      objectFit: "contain",
                      borderRadius: 12,
                    }}
                  />
                </div>
              </div>
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
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 12,
                  background: "#f5f7fb",
                  border: "1px solid #e7eaf3",
                  lineHeight: 1.6,
                }}
              >
                {imageMessage}
              </div>
            )}

            {imageReport && (
              <div
                style={{
                  marginTop: 18,
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 18,
                  background: "#fcfcfd",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  Resultado da verificação
                </h3>

                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#f3f4f6",
                    fontWeight: 700,
                    color: getConfidenceColor(imageReport.confidenceLabel),
                    border: `1px solid ${getConfidenceColor(
                      imageReport.confidenceLabel
                    )}`,
                  }}
                >
                  Confiabilidade da imagem: {imageReport.confidenceLabel}
                </div>

                <div style={{ marginTop: 16 }}>
                  <ProgressBar
                    label="Probabilidade de geração por IA"
                    value={imageReport.aiProbability}
                  />
                  <ProgressBar
                    label="Risco de manipulação/edição"
                    value={imageReport.manipulationRisk}
                  />
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>
                    Sinais detectados
                  </h4>
                  <ul style={{ marginTop: 0, paddingLeft: 20, lineHeight: 1.7 }}>
                    {imageReport.observedSigns.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    lineHeight: 1.6,
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>
                    Contexto e verificação
                  </h4>
                  <div>
                    Origem analisada: <b>{imageReport.sourceType}</b>
                  </div>
                  <div>
                    Busca reversa disponível para investigação complementar.
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f5f7fb",
                    border: "1px solid #e7eaf3",
                    lineHeight: 1.6,
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>Recomendação</h4>
                  <div>{imageReport.recommendation}</div>
                </div>
              </div>
            )}
          </>
        )}

        {mode === "video" && (
          <>
            <h2 style={sectionTitleStyle}>Verificar Vídeo</h2>

            <p style={{ marginTop: 0, color: "#444", lineHeight: 1.6 }}>
              Envie um vídeo para triagem inicial de <b>deepfake</b>, edição ou
              manipulação.
            </p>

            <div
              style={{
                marginTop: 12,
                border: "2px dashed #d1d5db",
                borderRadius: 16,
                padding: 18,
                background: "#fafafa",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 10 }}>
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
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
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
              <div style={{ marginTop: 18 }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  Frames extraídos automaticamente
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                  }}
                >
                  {videoFrames.map((frame, index) => (
                    <div
                      key={index}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 14,
                        padding: 10,
                        background: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 8,
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
              </div>
            )}

            {videoResult && (
              <div
                style={{
                  marginTop: 18,
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 18,
                  background: "#fcfcfd",
                  lineHeight: 1.7,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>
                  Resultado da verificação
                </h3>

                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#f3f4f6",
                    fontWeight: 700,
                    color: getAttentionColor(videoResult.attentionLevel),
                    border: `1px solid ${getAttentionColor(
                      videoResult.attentionLevel
                    )}`,
                    marginBottom: 12,
                  }}
                >
                  Nível de atenção do vídeo: {videoResult.attentionLevel}
                </div>

                <ProgressBar
                  label="Pontuação inicial de risco"
                  value={videoResult.attentionScore}
                />

                <div style={{ marginTop: 14 }}>
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

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>
                    Leitura inicial dos frames
                  </h4>
                  <ul style={{ marginTop: 0, paddingLeft: 20 }}>
                    {videoResult.frameReadings.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>
                    Sinais detectados
                  </h4>
                  <ul style={{ marginTop: 0, paddingLeft: 20 }}>
                    {videoResult.detectedSigns.map((sign, index) => (
                      <li key={index}>{sign}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 12,
                    background: "#f5f7fb",
                    border: "1px solid #e7eaf3",
                  }}
                >
                  <h4 style={{ marginTop: 0, marginBottom: 8 }}>Recomendação</h4>
                  <div>{videoResult.recommendation}</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <b>Próximo passo:</b> {videoResult.nextStep}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
