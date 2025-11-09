require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json()); // <-- required, fixes 400 on JSON bodies

// 1) Load ABI + address written by deploy script
const contractMeta = JSON.parse(
  fs.readFileSync(path.join(__dirname, "contract.json"), "utf8")
);

// 2) Build provider + signer (ethers v6)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 3) Contract instance with signer (so we can send txs)
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS || contractMeta.address,
  contractMeta.abi,
  wallet
);

// Health
app.get("/", (_req, res) => res.json({ ok: true }));

// Register student (owner-only in contract)
app.post("/register", async (req, res) => {
  try {
    const { roll, name } = req.body;
    if (!roll || !name) return res.status(400).json({ error: "roll and name are required" });

    const tx = await contract.registerStudent(Number(roll), String(name));
    const receipt = await tx.wait();
    return res.json({ txHash: receipt.hash });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.shortMessage || e.message) });
  }
});

// Mark present
app.post("/mark", async (req, res) => {
  try {
    const { roll, date } = req.body; // date: "YYYY-MM-DD"
    if (!roll || !date) return res.status(400).json({ error: "roll and date are required" });

    const tx = await contract.markPresent(Number(roll), String(date));
    const receipt = await tx.wait();
    return res.json({ txHash: receipt.hash });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.shortMessage || e.message) });
  }
});

// Read-only endpoints (no signer tx)
app.get("/student/:roll", async (req, res) => {
  try {
    const roll = Number(req.params.roll);
    const [name, registered] = await contract.getStudent(roll);
    return res.json({ roll, name, registered });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.shortMessage || e.message) });
  }
});

app.get("/present/:roll/:date", async (req, res) => {
  try {
    const roll = Number(req.params.roll);
    const date = req.params.date; // "YYYY-MM-DD"
    const p = await contract.isPresent(roll, date);
    return res.json({ roll, date, present: p });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: String(e.shortMessage || e.message) });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
