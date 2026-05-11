import axios from "axios";

/**
 * api/api.js
 * ─────────────────────────────────────────────────────────────
 * SEC-01 patch: every request now carries the x-api-key header.
 *
 * Set REACT_APP_API_KEY in your Vercel environment variables
 * (same value as API_KEY in Render).
 *
 * For local development add to your .env:
 *   REACT_APP_API_URL=http://localhost:5000/api
 *   REACT_APP_API_KEY=your-local-api-key
 */

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "x-api-key": process.env.REACT_APP_API_KEY || ""
  }
});

export default API;