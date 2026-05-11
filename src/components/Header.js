import React, { useState } from "react";
import axios from "axios";

/**
 * Header.js (fixed)
 * ─────────────────────────────────────────────────────────────
 * Fix: the reset endpoint (POST /api/system/reset) requires
 * ADMIN_API_KEY in the x-api-key header, not the regular API_KEY.
 *
 * The shared API instance sends REACT_APP_API_KEY (= API_KEY),
 * which the backend's adminApiKey middleware rejects with 401
 * because it compares against ADMIN_API_KEY — a different value.
 *
 * Fix: make a one-off axios call for reset that uses
 * REACT_APP_ADMIN_API_KEY instead of the shared API instance.
 *
 * Add REACT_APP_ADMIN_API_KEY to your Vercel environment variables
 * (same value as ADMIN_API_KEY in Render).
 */
export default function Header() {
  const [resetting, setResetting]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setResetting(true);

    try {
      // FIX: use a direct axios call with the ADMIN key,
      // not the shared API instance which carries the regular API_KEY.
      await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/system/reset`,
        {},
        {
          headers: {
            "x-api-key": process.env.REACT_APP_ADMIN_API_KEY || ""
          }
        }
      );

      window.location.reload();
    } catch (error) {
      console.error("Reset failed:", error);
      const msg = error.response?.status === 401
        ? "Reset failed: admin key not authorised. Check REACT_APP_ADMIN_API_KEY in Vercel env vars."
        : "Reset failed. Please try again.";
      alert(msg);
      setResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-position">
          <img src="./android-chrome-512x512.png" className="logo" alt="" />
          <div className="header-text">
            <h1>DataTrust-SC</h1>
            <p>A Trusted and Privacy-Preserving Data Distribution Framework for Smart Cities</p>
          </div>
        </div>

        <div className="header-actions">
          {!showConfirm ? (
            <button
              className="reset-btn"
              onClick={() => setShowConfirm(true)}
              disabled={resetting}
            >
              🔄 Reset System
            </button>
          ) : (
            <div className="confirm-reset">
              <span className="confirm-text">⚠️ Delete all data?</span>
              <button
                className="confirm-yes"
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? "Resetting..." : "Yes, Reset"}
              </button>
              <button
                className="confirm-no"
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}