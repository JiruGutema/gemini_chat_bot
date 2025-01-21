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

    welcomeDiv.style.backgroundColor = "#1E1E2F";
    welcomeDiv.style.boxShadow = "0 4px 8px rgba(223, 31, 31, 0.1)";
    // welcomeDiv.style.backdropFilter = "blur(10px)";
    welcomeDiv.innerHTML = `
      <p style="font-family: 'Arial', sans-serif; color: white;">Welcome to your account <br /> ${username}</p>
      <button id="Logout" style="margin-top: 10px; padding: 10px; border: 1px solid gray; background-color: #202130; color: white;cursor: pointer;" onclick="logout()">Logout</button>
      <button id="clearHistoryBtn" style="margin-top: 10px; padding: 10px; background-color: #202130; color: white; border: 1px solid gray; cursor: pointer;">Clear History</button>
    `;
    document.body.appendChild(welcomeDiv);

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("username");
      location.reload();
    });

    document
      .getElementById("clearHistoryBtn")
      .addEventListener("click", async () => {
        const res = await fetch(
          `https://jiren-intellij-backend.onrender.com/clearHistory?username=${username}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (res.ok) {
          alert("History cleared successfully.");
          loadHistory(username);
        } else {
          alert("Error clearing history.");
        }
      });
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
    setTimeout(() => {
      loadHistory(username);
    }, 2000);
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
  const prePrompt = document.getElementById("prompt").value;
  const instruction =
    "For any code snippets, please use <pre> and <code> to inclose the given code part.";
  if (prePrompt === "") {
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
  // Create a pop-up notification
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.bottom = "20px";
  notification.style.right = "20px";
  notification.style.padding = "10px 20px";
  notification.style.backgroundColor = "#1E1E2F";
  notification.style.color = "white";
  notification.style.borderRadius = "5px";
  notification.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  notification.style.zIndex = "1000";
  notification.textContent = "Your request is being processed...";

  document.body.appendChild(notification);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);

  prompt = instruction + prePrompt;

  const username = localStorage.getItem("username");
  const historyDiv = document.getElementById("history");
  historyDiv.scrollTop = historyDiv.scrollHeight; // Retrieve username from localStorage
  const inputField = document.getElementById("prompt");
  inputField.value = "";
  inputField.placeholder = "Waiting...";

  const res = await fetch(
    "https://jiren-intellij-backend.onrender.com/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, username }), // Send username with request
    }
  );
  loadHistory(username);
  inputField.placeholder = "Type something here...";
  const data = await res.json();
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
