"use client";

import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  async function analyzeText() {
    if (!text.trim()) {
      setResult({
        classification: "Nenhum texto inserido",
        summary: "Cole um texto para iniciar a verificação.",
        recommendation: "Adicionar conteúdo para análise.",
      });
      return;
    }

    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      setResult({
        classification: data.classification || "Análise recebida",
        summary: data.summary || "IA analisou o texto.",
        recommendation: data.recommendation || "Consultar fontes confiáveis.",
      });
    } catch (error) {
      setResult({
        classification: "Erro",
        summary: "Não foi possível conectar com a IA.",
        recommendation: "Tente novamente.",
      });
    }
  }

  function reset() {
    setMode("");
    setText("");
    setResult(null);
  }

  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(circle at top, #1e293b, #020617)",
        fontFamily: "Arial, sans-serif",
        color: "white",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 850,
          background: "rgba(15,23,42,0.82)",
          borderRadius: 24,
          padding: 30,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <img
                src="/logo.png"
                alt="Logo TrueCheck"
                style={{
                  height: 56,
                  width: "auto",
                  display: "block",
                }}
              />

              <h1
                style={{
                  margin: 0,
                  fontSize: 42,
                  fontWeight: 700,
                }}
              >
                TrueCheck
              </h1>
            </div>

            <p
              style={{
                color: "#94a3b8",
                marginTop: 8,
                marginBottom: 0,
                fontSize: 18,
              }}
            >
              Segurança e verificação de conteúdo
            </p>
          </div>

          <button onClick={reset} style={buttonStyle}>
            Início
          </button>
        </div>

        {!mode && (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontWeight: 700, fontSize: 22, marginBottom: 14 }}>
              Escolha o tipo de verificação
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() => setMode("text")}
                style={buttonStyle}
              >
                Verificar Texto
              </button>

              <button style={buttonStyle}>Verificar Imagem</button>

              <button style={buttonStyle}>Verificar Vídeo</button>
            </div>
          </div>
        )}

        {mode === "text" && (
          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>Verificar Texto</h2>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui a notícia ou texto..."
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
                marginTop: 10,
                fontSize: 18,
                boxSizing: "border-box",
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
              <button onClick={analyzeText} style={buttonStyle}>
                Verificar
              </button>

              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                }}
                style={buttonStyle}
              >
                Limpar
              </button>
            </div>

            {result && (
              <div
                style={{
                  marginTop: 20,
                  background: "#020617",
                  padding: 18,
                  borderRadius: 14,
                  border: "1px solid #374151",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Resultado da verificação</h3>

                <p>
                  <b>Classificação:</b> {result.classification}
                </p>

                <p>
                  <b>Análise:</b> {result.summary}
                </p>

                <p>
                  <b>Recomendação:</b> {result.recommendation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
