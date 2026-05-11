import React, { useEffect, useState } from "react";
import API from "../api/api";

/**
 * DataRequester.js (fixed)
 * ─────────────────────────────────────────────────────────────
 * Fix: category list was polling every 3s (20 req/min) to keep
 * the dropdown up to date. Categories only change when someone
 * uploads a new dataset — not every 3 seconds. This was the
 * single biggest waste of rate limit budget.
 *
 * New approach: fetch once on mount + a manual "Refresh" button
 * so the user can pull fresh categories when they know new data
 * was uploaded. Zero background polling. Zero rate limit burn.
 */
export default function DataRequester() {
  const [role, setRole]           = useState("");
  const [attribute, setAttribute] = useState("");
  const [category, setCategory]   = useState("");
  const [categories, setCategories] = useState([]);
  const [result, setResult]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [error, setError]         = useState("");

  const attributeOptions = [
    "sensitivity=public",
    "sensitivity=private"
  ];

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res    = await API.get("/dataset");
      const unique = [
        ...new Set(res.data.map(d => d.metadata.Data_Category))
      ].filter(Boolean);
      setCategories(unique);
      setError("");
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load categories");
    } finally {
      setCatLoading(false);
    }
  };

  // FIX: fetch ONCE on mount — no polling interval at all.
  // Categories are stable; they only change on new uploads.
  useEffect(() => {
    fetchCategories();
  }, []);

  const requestAccess = async () => {
    setResult("");
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/access/request", { category, role, attribute });

      if (res.data.records && res.data.records.length > 0) {
        const formattedRecords = res.data.records
          .map((r, idx) => `Record ${idx + 1}:\n${r.data}`)
          .join("\n\n" + "=".repeat(50) + "\n\n");

        setResult(
          `✅ Access Granted!\n\nTotal Records: ${res.data.count}\n\n` +
          `${"=".repeat(50)}\n\n${formattedRecords}`
        );
      } else {
        setResult("No records returned");
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Access request failed";
      setError(`❌ ${errorMsg}`);
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Data Requester</h3>

      <select value={role} onChange={e => setRole(e.target.value)}>
        <option value="">Select Role</option>
        <option value="Citizen">Citizen</option>
        <option value="CityAuthority">CityAuthority</option>
        <option value="Researcher">Researcher</option>
      </select>

      <select value={attribute} onChange={e => setAttribute(e.target.value)}>
        <option value="">Select Attribute</option>
        {attributeOptions.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      {/* Category dropdown + manual refresh button */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ flex: 1 }}
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={fetchCategories}
          disabled={catLoading}
          title="Refresh category list"
          style={{
            padding: "6px 10px",
            background: "var(--color-background-secondary, #f5f5f5)",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: catLoading ? "not-allowed" : "pointer",
            fontSize: "14px"
          }}
        >
          {catLoading ? "⏳" : "🔄"}
        </button>
      </div>

      <button
        onClick={requestAccess}
        disabled={!role || !attribute || !category || loading}
      >
        {loading ? "Requesting..." : "Request Access"}
      </button>

      {error && <div className="error" style={{ marginTop: "10px" }}>{error}</div>}

      {result && (
        <div style={{
          marginTop: "10px",
          maxHeight: "300px",
          overflowY: "auto",
          background: "#f5f5f5",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          whiteSpace: "pre-wrap",
          fontSize: "12px"
        }}>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}