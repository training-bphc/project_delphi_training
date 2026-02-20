// sampleTestDataRoutes.ts
// Express route for fetching SAMPLETESTDATA from PostgreSQL

import { Router } from "express";
import pool from "../config/db"; // PostgreSQL connection pool

const router = Router();

/**
 * GET /api/sampletestdata
 * Fetches all rows from SAMPLETESTDATA table, sorted by S_no ascending.
 */
router.get("/sampletestdata", async (req, res) => {
  try {
    // Query all rows from SAMPLETESTDATA, sorted by S_no
    const result = await pool.query(
      "SELECT * FROM SAMPLETESTDATA ORDER BY S_no ASC",
    );
    res.json(result.rows);
  } catch (error) {
    // Log and return error
    console.error("Error fetching sample test data:", error);
    res.status(500).json({ error: "Failed to fetch sample test data" });
  }
});

export default router;
