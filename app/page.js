"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState(""); // "", "text", "image", "video"

  // Texto
  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState("");

  // Imagem
  const [imageFile, setImageFile] = useState(null);
  const [imageResult, setImageResult] = useState("");

  const imagePreviewUrl = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  // Vídeo (placeholder simples)
  const [videoFile, setVideoFile] = useState(null);
  const [videoResult, setVideoResult] = useState("");

  function resetAll() {
    setMode("");
    setText("");
    setTextResult("");
    setImageFile(null);
    setImageResult("");
    setVideoFile(null);
    setVideoResult("");
  }

  function analyzeText() {
    if (!text.trim()) {
      setTextResult("Cole um texto para verificar.");
      return;
    }
    setTextResult(
      "Recebido ✅ Próximo passo: checagem real (IA + fontes confiáveis)."
    );
  }

  function analyzeImage() {
    if (!imageFile) {
      setImageResult("Selecione uma imagem para analisar.");
      return;
    }

    // Placeholder (simulação) — depois conectaremos a IA real
    const aiProbability = Math.floor(35 + Math.random() * 55); // 35–90%
    const manipulationRisk = Math.floor(10 + Math.random() * 70); // 10–80%

    const signs = [
      "padrões repetitivos incomuns",
      "bordas com artefatos",
      "texturas com inconsistência",
      "compressão irregular",
      "sombras/iluminação suspeitas",
    ];

    const pick = () => signs[Math.floor(Math.random() * signs.length)];
    const s1 = pick();
    const s2 = pick();

    setImageResult(
      `Resultado (prévia):\n\n` +
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
    setVideoResult(
      "Vídeo recebido ✅ Próximo passo: extrair frames e detectar indícios de deepfake/manipulação."
    );
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
        <div style={{ display: "flex
