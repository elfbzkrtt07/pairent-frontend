export async function askBibi(message: string) {
  const res = await fetch("http://127.0.0.1:5000/api/bibi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  return data.reply || data.error || "No reply received.";
}
