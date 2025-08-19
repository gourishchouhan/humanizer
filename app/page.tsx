"use client";
import { useState } from "react";
import TextArea from "../components/TextArea";
import { humanizeText } from "../lib/api";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleHumanize = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const result = await humanizeText(input);
    setOutput(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Emerald Void Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #000000 40%, #072607 100%)",
        }}
      />
      {/* Content */}
      <main className="relative z-10 p-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-emerald-400">
          AI Content Humanizer
        </h1>
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Paste AI-generated text here..."
        />
        <button
          onClick={handleHumanize}
          disabled={loading}
          className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Humanize"}
        </button>
        {output && (
          <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black/30 shadow-lg">
            <h2 className="font-semibold mb-2 text-emerald-300">
              Humanized Output:
            </h2>
            <p className="whitespace-pre-wrap">{output}</p>
          </div>
        )}
      </main>
    </div>
  );
}