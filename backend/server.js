// server.js
const express = require("express");
const { groth16 } = require("snarkjs");
const app = express();
const cors = require("cors");
// import express from "express";
// import cors from "cors";
// import { groth16 } from "snarkjs";
// import fs from "fs";

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

app.listen(3001, () => console.log("ZKP Auth Backend running on http://localhost:3001"));
