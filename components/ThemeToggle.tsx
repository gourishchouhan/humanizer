"use client";
import React from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    const current =
      (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "dark";
    setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 10,
        border: "1px solid var(--border)",
        background: "var(--card)",
        color: "var(--text)",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          display: "inline-block",
          borderRadius: "50%",
          background:
            theme === "dark"
              ? "conic-gradient(from 180deg at 50% 50%, #ffd166 0deg, #ffa43b 360deg)"
              : "radial-gradient(circle at 30% 30%, #ffd166 0%, #ffec99 60%, transparent 61%)",
          boxShadow: theme === "dark" ? "0 0 8px rgba(255, 209, 102, .35)" : "none",
        }}
      />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}