"use client";

import { useState } from "react";

export default function Home() {

  const [mode, setMode] = useState("");
  const [text, setText] = useState("");
  const [textResult, setTextResult] = useState(null);

  async function analyzeText() {

    if (!text.trim()) {
      setTextResult({
        classification: "Nenhum texto inserido.",
        size: 0,
        sentences: 0,
        observation: "Cole um texto para iniciar a análise.",
        nextStep: "Adicionar conteúdo para triagem inicial."
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

      setTextResult({
        classification: data.classification || "Análise recebida",
        size: text.length,
        sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
        observation: data.summary || "IA analisou o texto.",
        nextStep: data.recommendation || "Consultar fontes confiáveis."
      });

    } catch (error) {

      setTextResult({
        classification: "Erro na análise.",
        size: text.length,
        sentences: 0,
        observation: "Não foi possível conectar com o sistema de IA.",
        nextStep: "Tente novamente."
      });

    }

  }

  function resetAll() {
    setMode("");
    setText("");
    setTextResult(null);
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      fontFamily: "Arial",
      padding: 20
    }}>

      <div style={{
        width: "100%",
        maxWidth: 800,
        background: "#111827",
        padding: 30,
        borderRadius: 20,
        color: "white"
      }}>

        <div style={{display:"flex",justifyContent:"space-between"}}>

          <div>
            <h1 style={{fontSize:40,margin:0}}>TrueCheck</h1>
            <p style={{color:"#94a3b8"}}>
              Segurança e verificação de conteúdo
            </p>
          </div>

          <button
            onClick={resetAll}
            style={{
              padding:"10px 14px",
              borderRadius:10,
              border:"none",
              cursor:"pointer"
            }}
          >
            Início
          </button>

        </div>

        {!mode && (
          <div style={{marginTop:20}}>

            <p style={{fontWeight:700}}>Escolha o tipo de verificação</p>

            <div style={{display:"flex",gap:10}}>

              <button
                onClick={()=>setMode("text")}
                style={{
                  padding:"10px 14px",
                  borderRadius:10,
                  border:"none",
                  cursor:"pointer"
                }}
              >
                Verificar Texto
              </button>

              <button
                onClick={()=>setMode("image")}
                style={{
                  padding:"10px 14px",
                  borderRadius:10,
                  border:"none",
                  cursor:"pointer"
                }}
              >
                Verificar Imagem
              </button>

              <button
                onClick={()=>setMode("video")}
                style={{
                  padding:"10px 14px",
                  borderRadius:10,
                  border:"none",
                  cursor:"pointer"
                }}
              >
                Verificar Vídeo
              </button>

            </div>

          </div>
        )}

        {mode === "text" && (

          <div style={{marginTop:20}}>

            <h2>Verificar Texto</h2>

            <textarea
              value={text}
              onChange={(e)=>setText(e.target.value)}
              rows={8}
              placeholder="Cole aqui o texto..."
              style={{
                width:"100%",
                padding:12,
                borderRadius:10,
                border:"1px solid #374151",
                background:"#020617",
                color:"white"
              }}
            />

            <div style={{display:"flex",gap:10,marginTop:12}}>

              <button
                onClick={analyzeText}
                style={{
                  padding:"10px 14px",
                  borderRadius:10,
                  border:"none",
                  cursor:"pointer"
                }}
              >
                Verificar
              </button>

              <button
                onClick={()=>{setText("");setTextResult(null);}}
                style={{
                  padding:"10px 14px",
                  borderRadius:10,
                  border:"none",
                  cursor:"pointer"
                }}
              >
                Limpar
              </button>

            </div>

            {textResult && (

              <div style={{
                marginTop:20,
                padding:15,
                borderRadius:12,
                background:"#020617",
                border:"1px solid #374151"
              }}>

                <h3>Resultado da análise</h3>

                <p><b>Classificação:</b> {textResult.classification}</p>
                <p><b>Tamanho do texto:</b> {textResult.size}</p>
                <p><b>Frases identificadas:</b> {textResult.sentences}</p>
                <p><b>Observação:</b> {textResult.observation}</p>
                <p><b>Próximo passo:</b> {textResult.nextStep}</p>

              </div>

            )}

          </div>

        )}

      </div>

    </main>
  );
}
