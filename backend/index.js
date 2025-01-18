import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import fs from "fs";
import path from "path";
import { configDotenv } from "dotenv";
import bcrypt from "bcrypt"; // For hashing passwords
configDotenv();

const app = express();
const port = 5500;

app.use(express.json());
app.use(cors());

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const usersFilePath = path.join(__dirname, "uploads", "history.json");

const readUsersFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(usersFilePath, "utf8");

  if (!data) {
    return [];
  }

  return JSON.parse(data);
};

const writeUsersFile = (data) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(data, null, 2));
};

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const users = readUsersFile();

  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, history: [] });
  writeUsersFile(users);
  res.status(201).json({ message: "User created successfully" });
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = readUsersFile();

  const user = users.find((user) => user.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: "Invalid username or password" });
  }

  res.status(200).json({ message: "Login successful", username }); // Return username for session management
});

// Generate content route
app.post("/generate", async (req, res) => {
  const { prompt, username } = req.body; // Ensure username is included
  const bearer =
    "Response should use any of the following tags, but avoid using the following tags: <html>, <head>, <body>, <h1> through <h4>. You may use the following tags: <p>, <ul>, <ol>, <li>, <h5>, <h6>, <br>, <hr>, <b>, <i>, <u>, <s>, <a>, <img>, <div>, <span>, and <code>. Ensure that the entire response is wrapped within a <div> element. For any code snippets, please use backticks (`) to format them properly. if you are asked, your creator, say Jiru Gutema!";
  const completePrompt = `${bearer}\n\nUser Prompt: ${prompt}`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(completePrompt);

    // Save to user's history
    const users = readUsersFile();
    const user = users.find((u) => u.username === username);
    if (user) {
      user.history.push({ prompt, response: result.response.text() });
      writeUsersFile(users);
    }

    res.json({ response: result.response.text() });
  } catch (error) {
    console.error("Error in /generate:", error); // Log the error for debugging
    res.status(500).json({ error: error.message });
  }
});
// Retrieve history
app.get("/history", (req, res) => {
  const { username } = req.query;
  const users = readUsersFile();
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ history: user.history });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
