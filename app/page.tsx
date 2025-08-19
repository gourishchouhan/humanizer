"use client";
import { useState } from "react";
import TextArea from "../components/TextArea";
import { humanizeText } from "../lib/api";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const handleHumanize = async () => {
    setErr(null);
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await humanizeText(input);
      setOutput(result);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setErr(null);
  };

  const copy = async (val: string, which: "input" | "output") => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      if (which === "input") {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 1200);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 1200);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen w-full relative" style={{ background: "var(--bg-gradient)" }}>
      {/* Background (Crimson Depth in dark, soft light in light) */}
      <div className="absolute inset-0 z-0" aria-hidden style={{ background: "var(--bg-gradient)" }} />
      {/* Content */}
      <main className="relative z-10 p-6 max-w-3xl mx-auto">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 style={{ color: "var(--text)", margin: 0 }} className="text-3xl sm:text-4xl font-bold">
              AI Content Humanizer
            </h1>
            <p style={{ color: "var(--muted)" }} className="mt-1">
              Paste text and get a clearer, more natural version.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            backdropFilter: "blur(6px)",
          }}
          className="p-4 sm:p-5"
        >
          <TextArea
            value={input}
            onChange={setInput}
            placeholder="Paste AI-generated text here..."
          />
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleHumanize}
              disabled={loading}
              style={{
                background: loading ? "var(--button-disabled)" : "var(--accent)",
                color: "white",
                borderRadius: 10,
                border: "none",
              }}
              className="px-4 py-2 font-semibold shadow"
            >
              {loading ? "Processing..." : "Humanize"}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={loading || (!input && !output)}
              style={{
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
              className="px-4 py-2"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => copy(input, "input")}
              disabled={loading || !input.trim()}
              style={{
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              }}
              className="px-4 py-2"
              title="Copy input"
            >
              {copiedInput ? "Copied" : "Copy input"}
            </button>
          </div>
        </div>

        {err && (
          <div
            role="alert"
            style={{
              background: "var(--danger-bg)",
              border: "1px solid var(--danger-border)",
              color: "var(--danger-text)",
              borderRadius: 12,
            }}
            className="mt-4 p-3"
          >
            {err}
          </div>
        )}

        {output && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
            }}
            className="mt-6 p-4 shadow"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 style={{ color: "var(--text)" }} className="font-semibold">
                Humanized Output
              </h2>
              <button
                type="button"
                onClick={() => copy(output, "output")}
                disabled={!output}
                style={{
                  background: "transparent",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  cursor: !output ? "not-allowed" : "pointer",
                }}
                className="px-3 py-1.5 text-sm"
                title="Copy output"
              >
                {copiedOutput ? "Copied" : "Copy output"}
              </button>
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                borderRadius: 12,
              }}
              className="p-3 whitespace-pre-wrap"
            >
              {output}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}