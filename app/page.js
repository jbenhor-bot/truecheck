"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  function handleCheck() {
    if (!text.trim()) {
      setResult("Cole um texto para verificar.");
      return;
    }
    // Por enquanto é um placeholder. Depois ligamos com IA/APIs.
    setResult("Análise inicial: recebido ✅ (próximo passo: conectar a checagem real).");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
        color: "#111",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 34 }}>TrueCheck</h1>
        <p style={{ marginTop: 8, color: "#444", lineHeight: 1.5 }}>
          Cole um texto (ou notícia) abaixo e clique em <b>Verificar</b>.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole aqui o texto que você quer checar..."
          rows={8}
          style={{
            width: "100%",
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ddd",
            outline: "none",
            resize: "vertical",
            fontSize: 15,
            lineHeight: 1.5,
          }}
        />

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button
            onClick={handleCheck}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Verificar
          </button>

          <button
            onClick={() => {
              setText("");
              setResult("");
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Limpar
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: "#f5f7fb",
              border: "1px solid #e7eaf3",
            }}
          >
            <b>Resultado:</b> {result}
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 13, color: "#666" }}>
          Próximo passo: conectar a checagem real (IA + fontes).
        </p>
      </div>
    </main>
  );
}
