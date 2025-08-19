import { NextResponse } from "next/server";

// Types for Google Generative Language API response
type GLPart = { text?: string };
type GLContent = { parts?: GLPart[] };
type GLCandidate = { content?: GLContent };
type GLGenerateContentResponse = { candidates?: GLCandidate[] };

type HumanizerFn = (text: string, ...rest: unknown[]) => string | Promise<string>;
type HumanizerModule = {
  humanizeAlgorithmic?: HumanizerFn;
  humanize?: HumanizerFn;
  default?: HumanizerFn;
};

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const { text } =
      (await req.json().catch(() => ({} as { text?: string }))) ?? ({} as { text?: string });
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Invalid request. Provide a non-empty 'text' string." },
        { status: 400 }
      );
    }

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

    const data = (await response.json()) as GLGenerateContentResponse;
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const aiOutput =
      parts[0]?.text?.trim() ||
      parts
        .map((p) => p.text)
        .filter((t): t is string => Boolean(t))
        .join("\n")
        .trim() ||
      "No response generated.";

    // Final pass through your algorithm (supports multiple export styles)
    let humanized = aiOutput;
    try {
      const mod = (await import("@/lib/humanizer")) as HumanizerModule;
      const algo: HumanizerFn | null =
        typeof mod.humanizeAlgorithmic === "function"
          ? mod.humanizeAlgorithmic
          : typeof mod.humanize === "function"
          ? mod.humanize
          : typeof mod.default === "function"
          ? mod.default
          : null;

      if (algo) {
        const result = await Promise.resolve(algo(aiOutput));
        if (typeof result === "string" && result.trim()) {
          humanized = result.trim();
        }
      }
    } catch {
      // fallback to aiOutput
    }

    return NextResponse.json({ humanized });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}