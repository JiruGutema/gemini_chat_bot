const scrollableDiv = document.getElementById("history");
const Account = document.getElementById("Account");
const Logout = document.getElementById("Logout");
const Generate = document.getElementById("generateSection");
const History = document.getElementById("history");
const Auth = document.getElementById("authSection");
const username = localStorage.getItem("username");

let welcomeDiv;

Account.addEventListener("click", () => {
  if (welcomeDiv) {
    welcomeDiv.remove();
    welcomeDiv = null;
  } else {
    welcomeDiv = document.createElement("div");
    welcomeDiv.style.position = "absolute";
    welcomeDiv.style.top = "50%";
    welcomeDiv.style.left = "50%";
    welcomeDiv.style.transform = "translate(-50%, -50%)";
    welcomeDiv.style.textAlign = "center";
    welcomeDiv.style.padding = "20px";
    welcomeDiv.style.border = "2px solid #fff";

    welcomeDiv.style.backgroundColor = "rgba(189, 189, 189, 0.8)";
    welcomeDiv.style.boxShadow = "0 4px 8px rgba(223, 31, 31, 0.1)";
    // welcomeDiv.style.backdropFilter = "blur(10px)";
    welcomeDiv.innerHTML = `<h1 style="font-family: 'Arial', sans-serif; color: #333;">Welcome to your account <br /> ${username}</h1>`;
    document.body.appendChild(welcomeDiv);
  }
});
// Function to scroll to the bottom
function scrollToBottom() {
  scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
}
const inputField = document.getElementById("prompt");
const button = document.getElementById("generateBtn");
inputField.addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    button.click();
  }
});

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

  const res = await fetch(
    "https://jiren-intellij-backend.onrender.com/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }
  );

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

  const res = await fetch("https://jiren-intellij-backend.onrender.com/login", {
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

// Function to scroll to the bottom
function scrollToBottom() {
  scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
}
document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const username = localStorage.getItem("username");
  const historyDiv = document.getElementById("history");
  historyDiv.scrollTop = historyDiv.scrollHeight; // Retrieve username from localStorage
  // Define responseDiv
  document.getElementById("prompt").placeholder = "Waiting for response...";

  const res = await fetch(
    "https://jiren-intellij-backend.onrender.com/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, username }), // Send username with request
    }
  );

  const data = await res.json();
  loadHistory(username);
});

document.getElementById("historyBtn").addEventListener("click", () => {
  const username = localStorage.getItem("username"); // Retrieve username from localStorage
  loadHistory(username);
});

async function loadHistory(username) {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "Loading history...";

  const res = await fetch(
    `https://jiren-intellij-backend.onrender.com/history?username=${username}`,
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
        ${console.log(item.response)}
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
    scrollToBottom();
  } else {
    historyDiv.innerHTML = "Error loading history.";
  }
}
