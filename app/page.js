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
  const [videoResult, setVideoResult] = useState("");

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
    setVideoResult("");
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

    if (imageFile) {
      setImageMessage(
        "Arquivo recebido ✅ Próximo passo: conectar o envio real da imagem para análise automática."
      );
      return;
    }

    if (!imageUrl.trim()) {
      setImageMessage("Envie uma imagem ou cole a URL de uma imagem.");
      return;
    }

    try {
      setImageLoading(true);

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
        "Para busca na internet, use uma URL de imagem. Depois vamos suportar melhor o arquivo enviado também."
      );
      return;
    }

    const encodedUrl = encodeURIComponent(imageUrl.trim());
    const googleLensUrl = `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
    window.open(googleLensUrl, "_blank");
  }

  function analyzeVideo() {
    if (!videoFile) {
      setVideoResult("Selecione um vídeo para analisar.");
      return;
    }

    setVideoResult(
      "Vídeo recebido ✅ Próximo passo: extrair frames e detectar indícios de deepfake/manipulação."
    );
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

            <p style={{ marginTop: 0, color: "#444" }}>
              Envie um vídeo para análise inicial de deepfake/manipulação.
            </p>

            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setVideoFile(file || null);
                setVideoResult("");
              }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={analyzeVideo} style={btnPrimary}>
                Analisar Vídeo
              </button>

              <button
                onClick={() => {
                  setVideoFile(null);
                  setVideoResult("");
                }}
                style={btnSecondary}
              >
                Limpar
              </button>
            </div>

            {videoResult && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "#f5f7fb",
                  border: "1px solid #e7eaf3",
                }}
              >
                <b>Resultado:</b> {videoResult}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
