export async function POST(req) {
  try {

    const { text } = await req.json();

    if (!text) {
      return Response.json(
        { error: "Texto não fornecido." },
        { status: 400 }
      );
    }

    const prompt = `
Você é um sistema de verificação de informações.

Analise o texto abaixo e responda em JSON.

Texto:
${text}

Responda neste formato:

{
"classification": "",
"confidence": "",
"possibleTopic": "",
"summary": "",
"recommendation": ""
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();

    const textResponse = data.choices[0].message.content;

    return new Response(textResponse, {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {

    return Response.json(
      { error: "Erro ao analisar texto." },
      { status: 500 }
    );

  }
}
