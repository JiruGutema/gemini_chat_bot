const scrollableDiv = document.getElementById("history");
const Account = document.getElementById("Account");
const Logout = document.getElementById("Logout");
const Generate = document.getElementById("generateSection");

const History = document.getElementById("history");
const Auth = document.getElementById("authSection");
const welcomeDiv = document.getElementById("welcomeDiv");
const usernameSpan = document.getElementById("usernameSpan");

// Retrieve token from localStorage
const token = localStorage.getItem("token");

// Decode token to get user information
function decodeToken(token) {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload;
}

// If token exists, set user info
if (token) {
  const { username } = decodeToken(token);
  usernameSpan.textContent = username;
}

document.getElementById("Account").setAttribute("src", "./assets/logo/profile.png");

Account.addEventListener("click", () => {
  if (welcomeDiv.style.display === "none" || welcomeDiv.style.display === "") {
    welcomeDiv.style.display = "block";
  } else {
    welcomeDiv.style.display = "none";
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

// Clear history functionality
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  console.log("History cleared!"); // Add specific history-clearing logic here
});

// Function to scroll to the bottom
function scrollToBottom() {
  scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
}

// Submit on Enter key press
const inputField = document.getElementById("prompt");
const button = document.getElementById("generateBtn");
inputField.addEventListener("keydown", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    button.click();
  }
});

// Handle page load
document.addEventListener("DOMContentLoaded", () => {
  if (token) {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("generateSection").style.display = "block";

    const { username } = decodeToken(token);
    setTimeout(() => {
      loadHistory(username);
    }, 2000);
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

// Signup functionality
document.getElementById("signupBtn").addEventListener("click", async () => {
  const username = document.getElementById("signupUsername").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const res = await fetch(`https://gemini-chat-bot-1-scae.onrender.com/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();

  output.textContent = data.message || data.error;
  output.style.display = "block";
  setTimeout(() => {
    output.style.display = "none";
  }, 3000);
});

// Login functionality
document.getElementById("loginBtn").addEventListener("click", async () => {
  const Account = document.getElementById("Account");
  const username = document.getElementById("signupUsername").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`https://gemini-chat-bot-1-scae.onrender.com/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (res.ok) {
    // Store token for session management
    localStorage.setItem("token", data.token);
    const { username } = decodeToken(data.token);

    document.getElementById("authSection").style.display = "none";
    document.getElementById("generateSection").style.display = "block";
    Account.style.display = "block";  

    setTimeout(() => {
      loadHistory(username);
    }, 5000);
  } else {
    output.textContent = data.error;
    output.style.display = "block";
    setTimeout(() => {
      output.style.display = "none";
    }, 3000);
  }
});

// Generate button functionality
document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;

  if (!prompt) {
    alert("Please enter a prompt");
    return;
  }

  const historyDiv = document.getElementById("history");

  // Add "Typing..." indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.textContent = "Jiren is typing...";
  typingIndicator.style.color = "#999";
  typingIndicator.style.fontStyle = "italic";
  historyDiv.appendChild(typingIndicator);
  scrollToBottom();

  // Clear input field
  const inputField = document.getElementById("prompt");
  inputField.value = "";
  inputField.placeholder = "Waiting...";

  try {
    const res = await fetch(`https://gemini-chat-bot-1-scae.onrender.com/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    // Remove typing indicator
    typingIndicator.remove();

    // Add new response to history
    const newResponse = document.createElement("div");
    newResponse.innerHTML = `
      <div class="prompt"><strong>You:</strong> ${prompt}</div>
      <br />
      <div class="response">
        <img src="./assets/logo/jiren.jpg" class="gptProfile" alt="Jiren" />
        ${data.response || "No response"}
      </div>
    `;
    historyDiv.appendChild(newResponse);
    scrollToBottom();
  } catch (error) {
    typingIndicator.remove();
    alert("Error processing your request. Please try again.");
    console.error(error);
  } finally {
    inputField.placeholder = "Type something here...";
  }
});

// Load history
async function loadHistory(username) {
  Account.style.display = "block";
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "Loading history...";

  try {
    const res = await fetch(`https://gemini-chat-bot-1-scae.onrender.com/history`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      historyDiv.innerHTML = data.history
        .map(
          (item) => `
          <div class="prompt"><strong>${username}:</strong> ${item.prompt}</div>
          <br />
          <div class="response">
            <a href="https://jirugutema.netlify.app" target="_blank" ><img  src="./assets/logo/jiren.jpg" class="gptProfile" alt="Jiren" /></a>
            ${item.response}
          </div>
        `
        )
        .join("");
      scrollToBottom();
    } else {
      historyDiv.innerHTML = "No history found.";
    }
  } catch (error) {
    historyDiv.innerHTML = "Error loading history.";
    console.error(error);
  }
}

// Clear history
document.getElementById("clearHistoryBtn").addEventListener("click", async () => {
  try {
    const res = await fetch(`https://gemini-chat-bot-1-scae.onrender.com/history`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

  document.getElementById("welcomeDiv").style.display = "none";
    if (res.ok) {
  
      loadHistory(decodeToken(token).username);
    } else {
      alert("Error clearing history.");
    }
  } catch (error) {Account.style.display = "none";
    alert("Error clearing history.");
    console.error(error);
  }
});

