"use client";

import { useState } from "react";

export default function Home() {
  const [mode, setMode] = useState("");
  const [text, setText] = useState("");

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7fb",
      fontFamily: "Arial"
    }}>
      <div style={{
        width: "600px",
        background: "white",
        padding: "30px",
        borderRadius: "10px"
      }}>
        <h1>TrueCheck</h1>

        {!mode && (
          <>
            <p>Escolha o tipo de verificação</p>

            <button onClick={() => setMode("text")} style={{marginRight:10}}>
              Verificar Texto
            </button>

            <button onClick={() => setMode("image")} style={{marginRight:10}}>
              Verificar Imagem
            </button>

            <button onClick={() => setMode("video")}>
              Verificar Vídeo
            </button>
          </>
        )}

        {mode === "text" && (
          <>
            <p>Cole o texto ou notícia:</p>

            <textarea
              value={text}
              onChange={(e)=>setText(e.target.value)}
              rows={6}
              style={{width:"100%"}}
            />

            <button style={{marginTop:10}}>
              Verificar
            </button>
          </>
        )}

        {mode === "image" && (
          <>
            <p>Envie uma imagem:</p>

            <input type="file" accept="image/*" />

            <button style={{marginTop:10}}>
              Analisar Imagem
            </button>
          </>
        )}

        {mode === "video" && (
          <>
            <p>Envie um vídeo:</p>

            <input type="file" accept="video/*" />

            <button style={{marginTop:10}}>
              Analisar Vídeo
            </button>
          </>
        )}

      </div>
    </main>
  );
}
