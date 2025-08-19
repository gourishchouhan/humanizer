export async function humanizeText(text: string) {
  const res = await fetch("app/api/humanize/route.ts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  return data.humanized;
}