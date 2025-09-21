export async function generateGranite(prompt: string) {
  try {
    const response = await fetch("http://localhost:3000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error("Server error: " + response.statusText);

    const result = await response.json();

    if (result.status === "succeeded") {
      return result.output;
    } else {
      throw new Error("Granite request failed");
    }
  } catch (err) {
    console.error("❌ Error calling Granite:", err);
    throw err;
  }
}
