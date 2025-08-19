import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const { text } = await req.json().catch(() => ({} as { text?: string }));
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Invalid request. Provide a non-empty 'text' string." },
        { status: 400 }
      );
    }

    // Prefer v1 + modern model names. Allow override via env.
    const apiVersion = process.env.GEMINI_API_VERSION || "v1";
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const systemPrompt = process.env.SYSTEM_PROMPT || "Humanize the following text.";

    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nText: ${text}` }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "Upstream error", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const humanized =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response generated.";

    return NextResponse.json({ humanized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}