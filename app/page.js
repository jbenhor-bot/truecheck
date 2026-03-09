"use client";

import { useState } from "react";

export default function Page() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setResult(null);
    setError("");

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

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#07111f",
        padding: "40px",
        color: "white",
        fontFamily: "system-ui"
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "38px", marginBottom: "10px" }}>
          TrueCheck
        </h1>

        <p style={{ color: "#b9c3d4", marginBottom: "30px" }}>
          Verificação inicial de imagem por arquivo ou URL
        </p>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px",
            background: "rgba(255,255,255,0.05)"
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Verificar Imagem</h2>

          <label>Enviar imagem</label>

          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "block", marginTop: "10px", marginBottom: "20px" }}
          />

          <label>ou cole a URL da imagem</label>

          <input
            type="text"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://exemplo.com/imagem.jpg"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              marginBottom: "20px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "white"
            }}
          />

          {previewUrl && (
            <div style={{ marginBottom: "20px" }}>
              <p>Prévia da imagem</p>

              <img
                src={previewUrl}
                alt="preview"
                style={{
                  maxHeight: "350px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleAnalyzeImage}
              disabled={loading}
              style={{
                background: "#06b6d4",
                border: "none",
                padding: "12px 20px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {loading ? "Analisando..." : "Analisar Imagem"}
            </button>

            <button
              onClick={handleReverseSearch}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "12px 20px",
                borderRadius: "10px",
                color: "white"
              }}
            >
              Buscar na internet
            </button>

            <button
              onClick={handleClear}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "12px 20px",
                borderRadius: "10px",
                color: "white"
              }}
            >
              Limpar
            </button>
          </div>

          {error && (
            <div
              style={{
                marginTop: "20px",
                background: "rgba(255,0,0,0.15)",
                padding: "12px",
                borderRadius: "10px"
              }}
            >
              {error}
            </div>
          )}

          {result && (
            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)"
              }}
            >
              <h3>Resultado da análise</h3>

              <p><strong>Origem:</strong> {result.sourceType}</p>
              <p><strong>Classificação:</strong> {result.classification}</p>
              <p><strong>Nível de atenção:</strong> {result.attentionLevel}</p>
              <p><strong>Pontuação:</strong> {result.score}</p>

              {result.file && (
                <>
                  <p><strong>Arquivo:</strong> {result.file.name}</p>
                  <p><strong>Tipo:</strong> {result.file.type}</p>
                  <p><strong>Tamanho:</strong> {result.file.sizeMB} MB</p>
                </>
              )}

              {/* EXIF */}
              {result.exif && (
                <div style={{ marginTop: "15px" }}>
                  <strong>Metadados EXIF:</strong>

                  <ul>
                    {result.exif.make && (
                      <li>Marca: {result.exif.make}</li>
                    )}

                    {result.exif.model && (
                      <li>Modelo: {result.exif.model}</li>
                    )}

                    {result.exif.software && (
                      <li>Software: {result.exif.software}</li>
                    )}

                    {result.exif.dateTimeOriginal && (
                      <li>
                        Data original:{" "}
                        {String(result.exif.dateTimeOriginal)}
                      </li>
                    )}

                    {result.exif.latitude &&
                      result.exif.longitude && (
                        <li>
                          GPS: {result.exif.latitude},{" "}
                          {result.exif.longitude}
                        </li>
                      )}
                  </ul>
                </div>
              )}

              {result.detectedSignals && (
                <div style={{ marginTop: "15px" }}>
                  <strong>Sinais detectados:</strong>

                  <ul>
                    {result.detectedSignals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ marginTop: "10px" }}>
                <strong>Recomendação:</strong> {result.recommendation}
              </p>

              <p>
                <strong>Próximo passo:</strong> {result.nextStep}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
