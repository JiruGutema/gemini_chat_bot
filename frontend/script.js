document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("generateSection").style.display = "block";
    loadHistory(username);
  } else {
    document.getElementById("authSection").style.display = "block";
    document
      .getElementById("generateSection")
      .style.setProperty("display", "none", "important");
    document
      .getElementById("history")
      .style.setProperty("display", "none", "important");
  }
});
const output = document.getElementById("output");

document.getElementById("signupBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5500/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  output.textContent = data.message || data.error;
  output.style.display = "block";
  setTimeout(() => {
    output.style.display = "none";
  }, 3000);
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5500/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (res.ok) {
    // Store username for session management
    localStorage.setItem("username", username);
    document.getElementById("authSection").style.display = "none";
    document.getElementById("generateSection").style.display = "block";

    

    loadHistory(username);
  } else {
    output.textContent = data.error;
    output.style.display = "block";
    setTimeout(() => {
      output.style.display = "none";
    }, 3000);
  }
});

document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const username = localStorage.getItem("username"); // Retrieve username from localStorage
  document.getElementById("prompt").ariaPlaceholder = "Generating...";

  const res = await fetch("http://localhost:5500/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, username }), // Send username with request
  });

  const data = await res.json();
  responseDiv.innerHTML = data.response || "No response generated.";
});

document.getElementById("historyBtn").addEventListener("click", () => {
  const username = localStorage.getItem("username"); // Retrieve username from localStorage
  loadHistory(username);
});
setInterval(() => {
  const username = localStorage.getItem("username");
  if (username) {
    loadHistory(username);
  }
}, 5000);

async function loadHistory(username) {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "Loading history...";

  const res = await fetch(
    `http://localhost:5500/history?username=${username}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = await res.json();
  if (res.ok) {
    historyDiv.innerHTML = data.history
      .map(
        (item) => `
        
         <div class="prompt"> <strong>${localStorage.getItem(
           "username"
         )}</strong> ${item.prompt}</div>
          <br />
        <div class="response">  <strong>Jiren-Intelli</strong> ${
          item.response
        } </div>
        
      `
      )
      .join("");
  } else {
    historyDiv.innerHTML = "Error loading history.";
  }
}
