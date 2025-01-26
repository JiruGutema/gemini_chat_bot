import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mysql from "mysql2/promise"; // MySQL library for async/await
import cors from "cors";
import bcrypt from "bcrypt"; // For hashing passwords
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
configDotenv();

const app = express();
const port = 5500;

app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
console.log(username, password, email)
  try {
    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Username is required and must be a string" });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required and must be a string" });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required and must be a string" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
      [username, email, hashedPassword]
    );

    // Retrieve the newly created user's ID
    const user_id = result[0].insertId;
    const token = generateToken({ id: user_id, username, email });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error in /signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
console.log(username, password)
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate token
    const token = generateToken({ id: user.id, username: user.username, email: user.email });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token." });
  }
};
// Generate content route
// Generate content route
app.post("/generate", authenticateToken, async (req, res) => {
  const { prompt } = req.body;

  const bearer =
    "Response should use any of the following tags, but avoid using the following tags: <html>, <head>, <body>, <h1> through <h4>. You may use the following tags: <p>, <ul>, <ol>, <li>, <h5>, <h6>, <br>, <hr>, <b>, <i>, <u>, <s>, <a>, <img>, <div>, <span>, and <code>. For any code snippets, please use <pre> and <code> to inclose the given code part. Ensure that the entire response is wrapped within a <div> element.@Jiru_Gutema_2025!";
  const completePrompt = `${bearer}\n\nUser Prompt: ${prompt}`;

  try {
    const user_id = req.user.user_id; // Retrieve user_id from decoded JWT payload
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(completePrompt);

    const responseString = result.response.candidates[0].content.parts[0].text;
    await pool.query("INSERT INTO history (user_id, prompt, response) VALUES (?, ?, ?)", [user_id, prompt, responseString]);

    // Send the response here once.
    return res.json({ response: responseString });  // Ensure the response is sent only once.
  } catch (error) {
    console.error("Error in /generate:", error);
    // Send the error response only once.
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Delete history
app.get("/history", authenticateToken, async (req, res) => {
  const user_id = req.user.user_id; // Retrieve user_id from decoded JWT payload

  try {
    const [rows] = await pool.query("SELECT * FROM history WHERE user_id = ?", [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No history found" });
    }

    // Send the response directly without logging it.
    return res.json({ history: rows });
  } catch (error) {
    console.error("Error in /history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const generateToken = (user) => {
  return jwt.sign(
    { 
      user_id: user.id, 
      username: user.username, 
      email: user.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: "15d" } // Token expires in 15 days
  );
};

app.delete("/history", authenticateToken, async (req, res) => {
  const user_id = req.user.user_id; // Retrieve user_id from decoded JWT payload

  try {
    // Delete history for the authenticated user
    const result = await pool.query("DELETE FROM history WHERE user_id = ?", [user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No history found to delete." });
    }

    res.json({ message: "History cleared!" });
  } catch (error) {
    console.error("Error in /history delete:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
