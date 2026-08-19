// CreatorHub AI bridge. Keeps the existing UI and local tools intact while routing generation to the secure backend.
const CREATORHUB_API = "/api/generate";

async function generateWithAI() {
  const context = document.querySelector("#toolContext")?.value.trim();
  if (!currentTool || !context) {
    showToast("Add some context first");
    return;
  }

  const button = document.querySelector("#generateButton");
  const resultBox = document.querySelector("#resultBox");
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="material-icons">hourglass_top</span> Thinking...';
  resultBox.classList.add("hidden");

  try {
    const response = await fetch(CREATORHUB_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool: currentTool[1],
        category: currentTool[0],
        context
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);

    const result = data.result || "The AI returned no text.";
    resultBox.textContent = result;
    resultBox.classList.remove("hidden");

    state.history.unshift({ name: currentTool[1], result, date: new Date().toLocaleString() });
    state.history = state.history.slice(0, 8);
    save();
    renderRecent();
    showToast("AI generated successfully ✦");
  } catch (error) {
    console.error(error);
    resultBox.textContent = `AI error: ${error.message}`;
    resultBox.classList.remove("hidden");
    showToast("AI request failed");
  } finally {
    button.disabled = false;
    button.innerHTML = original;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("#generateButton");
  if (button) button.onclick = generateWithAI;
});
