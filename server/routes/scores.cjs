const { Router } = require("express")
const router = Router()

const COLLECTION = "scores"
const LEADERBOARD_LIMIT = 10

// GET /api/scores
// Returns the top 10 scores, deduplicated by player initials (one entry per player,
// their all-time highest score), sorted highest first
router.get("/", async (req, res) => {
  try {
    const scores = await req.db
      .collection(COLLECTION)
      .aggregate([
        { $sort: { score: -1 } },
        { $group: { _id: "$player", score: { $max: "$score" } } },
        { $sort: { score: -1 } },
        { $limit: LEADERBOARD_LIMIT },
        { $project: { _id: 0, player: "$_id", score: 1 } },
      ])
      .toArray()

    res.json(scores)
  } catch (err) {
    console.error("GET /api/scores error:", err)
    res.status(500).json({ error: "Failed to fetch scores" })
  }
})

// POST /api/scores
// Body: { player: "AKR", score: 123456 }
// Inserts the score and returns the created document
router.post("/", async (req, res) => {
  const { player, score } = req.body

  if (!player || typeof score !== "number") {
    return res
      .status(400)
      .json({ error: "Request body must include player (string) and score (number)" })
  }

  try {
    const doc = {
      player: String(player).toUpperCase().slice(0, 3), // classic 3-letter initials
      score,
      date: new Date(),
    }

    const result = await req.db.collection(COLLECTION).insertOne(doc)
    res.status(201).json({ _id: result.insertedId, ...doc })
  } catch (err) {
    console.error("POST /api/scores error:", err)
    res.status(500).json({ error: "Failed to save score" })
  }
})

module.exports = router
