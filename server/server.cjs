const express = require("express")
const cors = require("cors")
const path = require("path")
const { MongoClient } = require("mongodb")
require("dotenv").config({ path: path.join(__dirname, "config.env") })

const app = express()
const PORT = process.env.PORT || 5000

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow your GitHub Pages frontend (and localhost for local dev)
const allowedOrigins = [
  "https://andonks.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`))
      }
    },
    methods: ["GET", "POST"],
  })
)

app.use(express.json())

// ─── MongoDB ─────────────────────────────────────────────────────────────────
// Connect ONCE at startup and reuse the client — never connect/close per request
let db

async function connectDB() {
  const client = new MongoClient(process.env.ATLAS_URI)
  await client.connect()
  db = client.db("dodonkpachi")
  console.log("Connected to MongoDB Atlas ✓")
}

// Make `db` available to route handlers via app.locals
app.use((req, _res, next) => {
  req.db = db
  next()
})

// ─── Routes ──────────────────────────────────────────────────────────────────
const scoresRouter = require("./routes/scores.cjs")
app.use("/api/scores", scoresRouter)

// Health-check — Render pings this to confirm the service is alive
app.get("/health", (_req, res) => res.json({ status: "ok" }))

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Route not found" }))

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err)
    process.exit(1)
  })
