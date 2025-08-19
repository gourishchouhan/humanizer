import { Hono } from "hono";
import { handle } from "hono/vercel";
import fetch from "node-fetch";

export const runtime = "nodejs";

const app = new Hono();

app.post("/", async (c) => {
  try {
    const { text } = await c.req.json();
    const systemPrompt = process.env.SYSTEM_PROMPT;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
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
      }
    );

    const data = await response.json();
    const humanized =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error processing";

    return c.json({ humanized });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Something went wrong" }, 500);
  }
});

export const POST = handle(app);