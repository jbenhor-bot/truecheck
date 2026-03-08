export async function POST(request) {
  try {
    const body = await request.json();
    const imageUrl = body.imageUrl?.trim();

    if (!imageUrl) {
      return Response.json(
        { error: "URL da imagem não enviada." },
        { status: 400 }
      );
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return Response.json(
        { error: "URL inválida." },
        { status: 400 }
      );
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const pathname = parsedUrl.pathname.toLowerCase();
    const fullUrl = imageUrl.toLowerCase();

    let aiProbability = 28;
    let manipulationRisk = 22;
    let observedSigns = [
      "A imagem foi recebida por URL para triagem inicial.",
      "Recomenda-se verificar contexto, data e fonte original.",
      "A busca reversa continua sendo uma etapa importante da investigação.",
    ];

    const suspiciousKeywords = [
      "ai",
      "generated",
      "fake",
      "synthetic",
      "deepfake",
      "midjourney",
      "dalle",
      "stable-diffusion",
      "render",
      "cgi",
    ];

    const trustworthyDomains = [
      "wikimedia.org",
      "wikipedia.org",
      "gov.br",
      "bbc.com",
      "nytimes.com",
      "reuters.com",
      "apnews.com",
    ];

    const socialDomains = [
      "instagram.com",
      "facebook.com",
      "fbcdn.net",
      "x.com",
      "twitter.com",
      "tiktok.com",
      "reddit.com",
    ];

    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"];

    const hasSuspiciousKeyword = suspiciousKeywords.some((word) =>
      fullUrl.includes(word)
    );

    const isTrustworthyDomain = trustworthyDomains.some((domain) =>
      hostname.includes(domain)
    );

    const isSocialDomain = socialDomains.some((domain) =>
      hostname.includes(domain)
    );

    const hasDirectImageExtension = imageExtensions.some((ext) =>
      pathname.endsWith(ext)
    );

    if (hasSuspiciousKeyword) {
      aiProbability += 34;
      manipulationRisk += 26;
      observedSigns = [
        "A URL contém termos frequentemente associados a geração sintética ou edição.",
        "O conteúdo merece validação adicional antes de qualquer conclusão.",
        "Convém investigar a origem da imagem e buscar publicações anteriores.",
      ];
    }

    if (isSocialDomain) {
      aiProbability += 12;
      manipulationRisk += 14;
      observedSigns.push(
        "A imagem parece vir de rede social, onde contexto e recorte podem ser alterados."
      );
    }

    if (!hasDirectImageExtension) {
      manipulationRisk += 10;
      observedSigns.push(
        "A URL não aparenta apontar diretamente para um arquivo de imagem tradicional."
      );
    }

    if (isTrustworthyDomain) {
      aiProbability -= 10;
      manipulationRisk -= 8;
      observedSigns.push(
        "O domínio parece mais confiável, mas ainda assim a verificação visual é recomendada."
      );
    }

    aiProbability = Math.max(5, Math.min(aiProbability, 95));
    manipulationRisk = Math.max(5, Math.min(manipulationRisk, 95));

    let recommendation =
      "Compare com a fonte original, verifique o contexto da publicação e use busca reversa para encontrar versões anteriores da imagem.";

    if (aiProbability >= 70 || manipulationRisk >= 70) {
      recommendation =
        "A imagem merece atenção reforçada. Verifique fonte original, contexto, publicações anteriores e evite compartilhar antes de confirmar.";
    } else if (isTrustworthyDomain && aiProbability < 40 && manipulationRisk < 40) {
      recommendation =
        "A imagem apresenta menos sinais de risco nesta triagem inicial, mas ainda é recomendado confirmar contexto, data e autoria.";
    }

    const result = {
      sourceType: "URL da imagem",
      aiProbability,
      manipulationRisk,
      observedSigns: observedSigns.slice(0, 4),
      recommendation,
    };

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "Erro ao analisar a imagem." },
      { status: 500 }
    );
  }
}
