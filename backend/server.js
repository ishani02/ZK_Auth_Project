const express = require("express");
const { groth16 } = require("snarkjs");
const app = express();
const cors = require("cors");
const fs = require("fs");
const path = require("path");

app.use(cors());
app.use(express.json());

const vKey = require("../circuits/verification_key.json");

app.post("/verify", async (req, res) => {
  try {
    const { proof, publicSignals } = req.body;
    const isValid = await groth16.verify(vKey, publicSignals, proof);
    res.json({ success: isValid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/register", (req, res) => {
  console.log("POST /register hit", req.body);
  const { email, firstName, lastName, passwordHash } = req.body;

  if (!email || !firstName || !lastName || !passwordHash) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const usersPath = path.join(__dirname, "users.json");
  let users = [];

  if (fs.existsSync(usersPath)) {
    try {
      const raw = fs.readFileSync(usersPath, "utf-8");
      users = JSON.parse(raw || "[]");
    } catch (err) {
      console.error("Failed to parse users.json:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }


  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "User already exists" });
  }

  users.push({ email, firstName, lastName, passwordHash });
  try {
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Failed to write to users.json:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.json({ success: true, message: "User registered successfully" });
});



app.post("/get-user", (req, res) => {
  const { email } = req.body;
  const usersPath = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});


app.listen(3001, () => console.log("ZKP Auth Backend running on http://localhost:3001"));
