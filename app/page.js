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
        recommendation: "Adicionar conteúdo para análise."
      });
      return;
    }

    try {

      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      setResult(data);

    } catch (error) {

      setResult({
        classification: "Erro",
        summary: "Não foi possível conectar com a IA.",
        recommendation: "Tente novamente."
      });

    }

  }

  function reset() {
    setMode("");
    setText("");
    setResult(null);
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "radial-gradient(circle at top, #1e293b, #020617)",
      fontFamily: "Arial",
      color: "white",
      padding: 20
    }}>

      <div style={{
        width: "100%",
        maxWidth: 850,
        background: "rgba(15,23,42,0.8)",
        borderRadius: 24,
        padding: 30,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
      }}>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>

          <div>

            <h1 style={{
              margin: 0,
              fontSize: 42,
              fontWeight: 700
            }}>
              TrueCheck
            </h1>

            <p style={{
              color: "#94a3b8",
              marginTop: 6
            }}>
              Segurança e verificação de conteúdo
            </p>

          </div>

          <button
            onClick={reset}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer"
            }}
          >
            Início
          </button>

        </div>

        {!mode && (

          <div style={{ marginTop: 25 }}>

            <p style={{ fontWeight: 700 }}>
              Escolha o tipo de verificação
            </p>

            <div style={{
              display: "flex",
              gap: 10,
              marginTop: 10
            }}>

              <button
                onClick={() => setMode("text")}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Verificar Texto
              </button>

              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "none"
                }}
              >
                Verificar Imagem
              </button>

              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "none"
                }}
              >
                Verificar Vídeo
              </button>

            </div>

          </div>

        )}

        {mode === "text" && (

          <div style={{ marginTop: 25 }}>

            <h2>Verificar Texto</h2>

            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole aqui a notícia ou texto..."
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #374151",
                background: "#020617",
                color: "white",
                marginTop: 10
              }}
            />

            <div style={{
              display: "flex",
              gap: 10,
              marginTop: 12
            }}>

              <button
                onClick={analyzeText}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Verificar
              </button>

              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Limpar
              </button>

            </div>

            {result && (

              <div style={{
                marginTop: 20,
                background: "#020617",
                padding: 16,
                borderRadius: 14,
                border: "1px solid #374151"
              }}>

                <h3>Resultado da verificação</h3>

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
