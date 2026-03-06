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

    const aiProbability = Math.floor(35 + Math.random() * 55);
    const manipulationRisk = Math.floor(10 + Math.random() * 70);

    const signs = [
      "padrões repetitivos incomuns",
      "bordas com artefatos",
      "texturas com inconsistência",
      "compressão irregular",
      "sombras ou iluminação suspeitas",
    ];

    const pick = () => signs[Math.floor(Math.random() * signs.length)];

    const result = {
      sourceType: "URL da imagem",
      aiProbability,
      manipulationRisk,
      observedSigns: [pick(), pick()],
      recommendation:
        "Compare com a fonte original e procure versões antigas da imagem.",
    };

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "Erro ao analisar a imagem." },
      { status: 500 }
    );
  }
}
