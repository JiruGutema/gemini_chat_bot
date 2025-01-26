const scrollableDiv = document.getElementById("history");
const Account = document.getElementById("Account");
const Logout = document.getElementById("Logout");
const Generate = document.getElementById("generateSection");
const History = document.getElementById("history");
const Auth = document.getElementById("authSection");
const username = localStorage.getItem("username");
const welcomeDiv = document.getElementById("welcomeDiv");
const usernameSpan = document.getElementById("usernameSpan");

// Set username text
usernameSpan.textContent = username;
document.getElementById("Account").setAttribute("src", "./assets/logo/profile.png")

Account.addEventListener("click", () => {
  if (welcomeDiv.style.display === "none" || welcomeDiv.style.display === "") {
    welcomeDiv.style.display = "block";
  } else {
    welcomeDiv.style.display = "none";
  }
});

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("username");
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

// Function to scroll to the bottom
function scrollToBottom() {
  scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
}
document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;

  if (prompt === "") {
    // Create a pop-up notification
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.right = "20px";
    notification.style.padding = "10px 20px";
    notification.style.backgroundColor = "#1E1E2F";
    notification.style.color = "red";
    notification.style.borderRadius = "5px";
    notification.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    notification.style.zIndex = "1000";
    notification.textContent = "Please enter a prompt";

    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
    return;
  }

  const username = localStorage.getItem("username");
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
    const res = await fetch(
      "https://jiren-intellij-backend.onrender.com/generate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, username }),
      }
    );

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

async function loadHistory(username) {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "Loading history...";

  let res;
  try {
    res = await fetch(
      `https://jiren-intellij-backend.onrender.com/history?username=${username}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    historyDiv.innerHTML = "Error fetching history.";
    console.error("Fetch error:", error);
    return;
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    historyDiv.innerHTML = "Error parsing history data.";
    console.error("JSON parse error:", error);
    return;
  }
  if (res.ok) {
    if (!Array.isArray(data.history) || data.history.length === 0) {
      historyDiv.innerHTML = "No history available.";
      historyDiv.style.textAlign = "center";
      historyDiv.style.marginTop = "20px";
      historyDiv.style.color = "red";
      return;
    }
    historyDiv.style.textAlign = "left";
    historyDiv.style.marginTop = "0";
    historyDiv.style.color = "white";
    historyDiv.innerHTML = data.history
      .map(
        (item) => `
  
         <div class="prompt"> <strong style="font-size: 24px">${username}</strong> ${item.prompt}</div>
          <br />
        <div class="response">  <img src="./assets/logo/jiren.jpg" class="gptProfile" alt="Jiren" ${item.response} </div>
        
      `
      )
      .join("");
    scrollToBottom();
  } else {
    historyDiv.innerHTML = "Error loading history.";
  }
}

document
  .getElementById("clearHistoryBtn")
  .addEventListener("click", async () => {
    const res = await fetch(
      `https://jiren-intellij-backend.onrender.com/history?username=${username}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.ok) {
      loadHistory(username);
      notification.style.display = "block";
      notification.textContent = "History cleared!";
      setTimeout(() => {
        notification.style.display = "none";
      }, 3000);
    } else {
      alert("Error clearing history.");
    }
  });
