"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("");

  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageResult, setImageResult] = useState("");

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
    setTextResult("");
    setImageFile(null);
    setImageUrl("");
    setImageResult("");
    setVideoFile(null);
    setVideoResult("");
  }

  function analyzeText() {
    if (!text.trim()) {
      setTextResult("Cole um texto para verificar.");
      return;
    }
    setTextResult("Recebido ✅ Próximo passo: checagem real com IA e fontes confiáveis.");
  }

  function analyzeImage() {
    if (!imageFile && !imageUrl.trim()) {
      setImageResult("Envie uma imagem ou cole a URL de uma imagem.");
      return;
    }

    const aiProbability = Math.floor(35 + Math.random() * 55);
    const manipulationRisk = Math.floor(10 + Math.random() * 70);

    const signs = [
      "padrões repetitivos incomuns",
      "bordas com artefatos",
      "texturas com inconsistência",
      "compressão irregular",
      "sombras/iluminação suspeitas",
    ];

    const s1 = signs[Math.floor(Math.random() * signs.length)];
    const s2 = signs[Math.floor(Math.random() * signs.length)];

    const sourceType = imageUrl.trim() ? "URL da imagem" : "arquivo enviado";

    setImageResult(
      `Resultado (prévia):\n\n` +
        `• Origem analisada: ${sourceType}\n` +
        `• Probabilidade de geração por IA: ${aiProbability}%\n` +
        `• Risco de manipulação/edição: ${manipulationRisk}%\n\n` +
        `Sinais observados:\n- ${s1}\n- ${s2}\n\n` +
        `Recomendação: compare com a fonte original e procure versões antigas da imagem.`
    );
  }

  function analyzeVideo() {
    if (!videoFile) {
      setVideoResult("Selecione um vídeo para analisar.");
      return;
    }
    setVideoResult("Vídeo recebido ✅ Próximo passo: extrair frames e detectar indícios de deepfake/manipulação.");
  }

  const cardStyle = {
    width: "100%",
    maxWidth: 760,
    background: "white",
    padding: 26,
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  };

  const btnPrimary = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  };

  const btnSecondary = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
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
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
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
              Dica: começaremos com análises iniciais e depois conectamos IA + fontes.
            </p>
          </>
        )}

        {mode === "text" && (
          <>
            <h2 style={{ marginTop: 18, marginBottom: 10 }}>Verificar Texto</h2>

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
                  setTextResult("");
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
                  padding: 12,
                  borderRadius: 12,
                  background: "#f5f7fb",
                  border: "1px solid #e7eaf3",
                }}
              >
                <b>Resultado:</b> {textResult}
              </div>
            )}
          </>
        )}

        {mode === "image" && (
          <>
            <h2 style={{ marginTop: 18, marginBottom: 10 }}>Verificar Imagem</h2>

            <p style={{ marginTop: 0, color: "#444" }}>
              Envie uma imagem ou cole a URL de uma imagem para analisar indícios de <b>IA</b> e <b>manipulação</b>.
            </p>

            <div style={{ marginBottom: 12 }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setImageFile(file || null);
                  setImageResult("");
                }}
              />
            </div>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImageResult("");
              }}
              placeholder="Ou cole aqui a URL da imagem..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                fontSize: 15,
              }}
            />

            {imagePreviewUrl && (
              <div style={{ marginTop: 12 }}>
                <img
                  src={imagePreviewUrl}
                  alt="Prévia da imagem"
                  style={{
                    width: "100%",
                    maxHeight: 360,
                    objectFit: "contain",
                    borderRadius: 12,
                    border: "1px solid #eee",
                    background: "#fafafa",
                  }}
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button onClick={analyzeImage} style={btnPrimary}>
                Analisar Imagem
              </button>

              <button
                onClick={() => {
                  setImageFile(null);
                  setImageUrl("");
                  setImageResult("");
                }}
                style={btnSecondary}
              >
                Limpar
              </button>
            </div>

            {imageResult && (
              <pre
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "#f5f7fb",
                  border: "1px solid #e7eaf3",
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                }}
              >
                {imageResult}
              </pre>
            )}
          </>
        )}

        {mode === "video" && (
          <>
            <h2 style={{ marginTop: 18, marginBottom: 10 }}>Verificar Vídeo</h2>

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
