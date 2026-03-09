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

    const reverseUrl = `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(
      targetUrl
    )}`;

    window.open(reverseUrl, "_blank");
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold">TrueCheck</h1>
          <p className="text-white/70">
            Verificação inicial de imagem por arquivo ou URL
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Verificar Imagem
          </h2>

          <p className="mb-6 text-sm text-white/70">
            Envie uma imagem ou cole a URL para analisar indícios de geração por
            IA e manipulação digital.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-xl font-semibold text-white">
              Entrada da imagem
            </h3>

            <label className="mb-2 block text-sm font-medium text-white">
              Enviar imagem
            </label>

            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4 block w-full text-sm text-white"
            />

            <label className="mb-2 block text-sm font-medium text-white">
              ou cole a URL da imagem
            </label>

            <input
              type="text"
              value={imageUrl}
              onChange={handleUrlChange}
              placeholder="https://exemplo.com/minha-imagem.jpg"
              className="mb-4 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none"
            />

            {previewUrl && (
              <div className="mb-4">
                <p className="mb-2 text-sm text-white/70">Prévia da imagem</p>
                <img
                  src={previewUrl}
                  alt="Prévia"
                  className="max-h-80 rounded-xl border border-white/10 object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAnalyzeImage}
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Analisando..." : "Analisar Imagem"}
              </button>

              <button
                onClick={handleReverseSearch}
                type="button"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white"
              >
                Buscar na internet
              </button>

              <button
                onClick={handleClear}
                type="button"
                className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white"
              >
                Limpar
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="mb-4 text-xl font-semibold text-white">
                Resultado da análise
              </h3>

              <div className="space-y-2 text-sm text-white/90">
                <p>
                  <strong>Origem:</strong> {result.sourceType}
                </p>
                <p>
                  <strong>Classificação:</strong> {result.classification}
                </p>
                <p>
                  <strong>Nível de atenção:</strong> {result.attentionLevel}
                </p>
                <p>
                  <strong>Pontuação:</strong> {result.score}
                </p>

                {result.file && (
                  <>
                    <p>
                      <strong>Nome do arquivo:</strong> {result.file.name}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {result.file.type}
                    </p>
                    <p>
                      <strong>Tamanho:</strong> {result.file.sizeMB} MB
                    </p>
                  </>
                )}

                {result.domain && (
                  <p>
                    <strong>Domínio:</strong> {result.domain}
                  </p>
                )}

                {Array.isArray(result.detectedSignals) &&
                  result.detectedSignals.length > 0 && (
                    <div>
                      <strong>Sinais detectados:</strong>
                      <ul className="mt-2 list-disc pl-5">
                        {result.detectedSignals.map((signal, index) => (
                          <li key={index}>{signal}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <p>
                  <strong>Recomendação:</strong> {result.recommendation}
                </p>

                <p>
                  <strong>Próximo passo:</strong> {result.nextStep}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
