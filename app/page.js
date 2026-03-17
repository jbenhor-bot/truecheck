"use client";

import { useMemo, useState } from "react";

export default function Page() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setResult(null);
    setError("");
    setShowTechnicalDetails(false);

    if (file) {
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      setImageUrl("");
    } else {
      setPreviewUrl("");
    }
  }

  function handleUrlChange(event) {
    const value = event.target.value;
    setImageUrl(value);
    setResult(null);
    setError("");
    setShowTechnicalDetails(false);

    if (value.trim()) {
      setSelectedFile(null);
      setPreviewUrl(value);
    } else if (!selectedFile) {
      setPreviewUrl("");
    }
  }

  async function handleAnalyzeImage() {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setShowTechnicalDetails(false);

      let response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        response = await fetch("/api/analyze-image", {
          method: "POST",
          body: formData
        });
      } else if (imageUrl.trim()) {
        response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageUrl: imageUrl.trim()
          })
        });
      } else {
        setError("Selecione uma imagem ou cole uma URL.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Erro ao analisar imagem.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setSelectedFile(null);
    setImageUrl("");
    setPreviewUrl("");
    setResult(null);
    setError("");
    setShowTechnicalDetails(false);

    const fileInput = document.getElementById("image-upload-input");
    if (fileInput) {
      fileInput.value = "";
    }
  }

  function handleReverseSearch() {
    const targetUrl = imageUrl.trim() || previewUrl.trim();

    if (!targetUrl.startsWith("http")) {
      alert("A busca reversa precisa de uma URL pública da imagem.");
      return;
    }

    const reverseUrl =
      "https://images.google.com/searchbyimage?image_url=" +
      encodeURIComponent(targetUrl);

    window.open(reverseUrl, "_blank");
  }

  const riskUi = useMemo(() => {
    const score = Number(result?.score ?? 0);

    if (score <= 40) {
      return {
        label: "ALTO RISCO",
        color: "#ef4444",
        softBg: "rgba(239,68,68,0.12)",
        border: "rgba(239,68,68,0.35)"
      };
    }

    if (score <= 70) {
      return {
        label: "RISCO MODERADO",
        color: "#f59e0b",
        softBg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.35)"
      };
    }

    return {
      label: "BAIXO RISCO",
      color: "#22c55e",
      softBg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.35)"
    };
  }, [result]);

  const scoreValue = Math.max(0, Math.min(100, Number(result?.score ?? 0)));

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #10203b 0%, #07111f 45%, #040814 100%)",
        padding: "32px 20px",
        color: "white",
        fontFamily: "system-ui"
      }}
    >
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.22)",
              color: "#7dd3fc",
              fontSize: "14px",
              marginBottom: "18px"
            }}
          >
            TrueCheck • Verificação inicial de autenticidade
          </div>

          <h1
            style={{
              fontSize: "42px",
              lineHeight: 1.1,
              marginBottom: "10px",
              fontWeight: 800
            }}
          >
            Analise imagens com um resultado mais claro, técnico e confiável
          </h1>

          <p
            style={{
              color: "#b9c3d4",
              fontSize: "17px",
              maxWidth: "780px",
              lineHeight: 1.6
            }}
          >
            Envie uma imagem ou cole uma URL para receber uma avaliação inicial
            com score, nível de risco, sinais detectados e detalhes técnicos.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "22px"
          }}
        >
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "24px",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
          >
            <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>
              Verificar imagem
            </h2>

            <label
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#dce6f3",
                fontWeight: 600
              }}
            >
              Enviar imagem
            </label>

            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                display: "block",
                width: "100%",
                marginBottom: "22px",
                color: "#dbeafe"
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#dce6f3",
                fontWeight: 600
              }}
            >
              Ou cole a URL da imagem
            </label>

            <input
              type="text"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://exemplo.com/imagem.jpg"
              style={{
                width: "100%",
                padding: "14px 14px",
                marginBottom: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.07)",
                color: "white",
                outline: "none",
                fontSize: "15px"
              }}
            />

            {previewUrl && (
              <div
                style={{
                  marginBottom: "20px",
                  borderRadius: "18px",
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)"
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                    color: "#cbd5e1",
                    fontSize: "14px"
                  }}
                >
                  Prévia da imagem
                </div>

                <div style={{ padding: "14px", textAlign: "center" }}>
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "360px",
                      borderRadius: "14px",
                      objectFit: "contain"
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleAnalyzeImage}
                disabled={loading}
                style={{
                  background: loading ? "#0891b2" : "#06b6d4",
                  border: "none",
                  padding: "13px 20px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  color: "#03131a",
                  boxShadow: "0 8px 20px rgba(6,182,212,0.25)"
                }}
              >
                {loading ? "Analisando..." : "Analisar imagem"}
              </button>

              <button
                onClick={handleReverseSearch}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "13px 18px",
                  borderRadius: "12px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Buscar na internet
              </button>

              <button
                onClick={handleClear}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "13px 18px",
                  borderRadius: "12px",
                  color: "white",
                  cursor: "pointer"
                }}
              >
                Limpar
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginTop: "20px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.28)",
                  color: "#fecaca",
                  padding: "14px",
                  borderRadius: "14px"
                }}
              >
                {error}
              </div>
            )}
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "22px",
              padding: "24px",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
          >
            {!result ? (
              <div
                style={{
                  minHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                <div
                  style={{
                    width: "74px",
                    height: "74px",
                    borderRadius: "18px",
                    background: "rgba(6,182,212,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    marginBottom: "18px"
                  }}
                >
                  🔍
                </div>

                <h3 style={{ fontSize: "24px", marginBottom: "10px" }}>
                  Resultado da análise
                </h3>

                <p style={{ color: "#b9c3d4", lineHeight: 1.7 }}>
                  O score, o nível de risco, os sinais detectados e os detalhes
                  técnicos aparecerão aqui após a análise.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    padding: "18px",
                    borderRadius: "18px",
                    background: riskUi.softBg,
                    border: `1px solid ${riskUi.border}`,
                    marginBottom: "18px"
                  }}
                >
                  <div
                    style={{
                      color: riskUi.color,
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      fontSize: "14px",
                      marginBottom: "8px"
                    }}
                  >
                    {riskUi.label}
                  </div>

                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: 800,
                      lineHeight: 1,
                      marginBottom: "6px"
                    }}
                  >
                    {scoreValue}
                    <span
                      style={{
                        fontSize: "22px",
                        color: "#9fb0c7",
                        marginLeft: "6px"
                      }}
                    >
                      / 100
                    </span>
                  </div>

                  <div style={{ color: "#d4deeb", fontSize: "15px" }}>
                    {result.classification || "Classificação indisponível"}
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      fontSize: "14px",
                      color: "#cbd5e1"
                    }}
                  >
                    <span>Barra de risco</span>
                    <span>{scoreValue}%</span>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: "14px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.08)",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}
                  >
                    <div
                      style={{
                        width: `${scoreValue}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background: riskUi.color,
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "18px"
                  }}
                >
                  <InfoCard
                    label="Origem"
                    value={result.sourceType || "—"}
                  />
                  <InfoCard
                    label="Atenção"
                    value={result.attentionLevel || "—"}
                  />
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    marginBottom: "16px"
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "10px",
                      fontSize: "16px"
                    }}
                  >
                    Sinais detectados
                  </div>

                  {Array.isArray(result.detectedSignals) &&
                  result.detectedSignals.length > 0 ? (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "18px",
                        color: "#d9e3f0",
                        lineHeight: 1.8
                      }}
                    >
                      {result.detectedSignals.map((signal, index) => (
                        <li key={index}>⚠ {signal}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: "#9fb0c7" }}>
                      Nenhum sinal específico foi retornado.
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    marginBottom: "12px"
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#bbf7d0"
                    }}
                  >
                    Recomendação
                  </div>
                  <div style={{ color: "#e7f7ed", lineHeight: 1.7 }}>
                    {result.recommendation || "Sem recomendação disponível."}
                  </div>
                </div>

                <div
                  style={{
                    padding: "16px",
                    borderRadius: "16px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    marginBottom: "14px"
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#dbeafe"
                    }}
                  >
                    Próximo passo
                  </div>
                  <div style={{ color: "#d9e3f0", lineHeight: 1.7 }}>
                    {result.nextStep || "Sem próximo passo definido."}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setShowTechnicalDetails(!showTechnicalDetails)
                  }
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    color: "white",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: 700,
                    marginBottom: showTechnicalDetails ? "12px" : "0"
                  }}
                >
                  {showTechnicalDetails
                    ? "Ocultar detalhes técnicos"
                    : "Ver detalhes técnicos"}
                </button>

                {showTechnicalDetails && (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.035)",
                      border: "1px solid rgba(255,255,255,0.08)"
                    }}
                  >
                    {result.file && (
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "8px",
                            color: "#dbeafe"
                          }}
                        >
                          Arquivo
                        </div>
                        <TechItem label="Nome" value={result.file.name} />
                        <TechItem label="Tipo" value={result.file.type} />
                        <TechItem
                          label="Tamanho"
                          value={`${result.file.sizeMB} MB`}
                        />
                      </div>
                    )}

                    {result.exif && (
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: "8px",
                            color: "#dbeafe"
                          }}
                        >
                          Metadados EXIF
                        </div>

                        <TechItem label="Marca" value={result.exif.make} />
                        <TechItem label="Modelo" value={result.exif.model} />
                        <TechItem
                          label="Software"
                          value={result.exif.software}
                        />
                        <TechItem
                          label="Data original"
                          value={String(result.exif.dateTimeOriginal || "—")}
                        />
                        <TechItem
                          label="GPS"
                          value={
                            result.exif.latitude && result.exif.longitude
                              ? `${result.exif.latitude}, ${result.exif.longitude}`
                              : "—"
                          }
                        />
                      </div>
                    )}

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: "8px",
                          color: "#dbeafe"
                        }}
                      >
                        Resumo técnico
                      </div>

                      <TechItem
                        label="Classificação"
                        value={result.classification}
                      />
                      <TechItem
                        label="Nível de atenção"
                        value={result.attentionLevel}
                      />
                      <TechItem
                        label="Origem"
                        value={result.sourceType}
                      />
                      <TechItem
                        label="Pontuação"
                        value={String(result.score)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ label, value }) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)"
      }}
    >
      <div
        style={{
          fontSize: "13px",
          color: "#9fb0c7",
          marginBottom: "6px"
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: "#f8fafc"
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function TechItem({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <span style={{ color: "#9fb0c7" }}>{label}</span>
      <span style={{ color: "#f8fafc", textAlign: "right" }}>
        {value || "—"}
      </span>
    </div>
  );
}
