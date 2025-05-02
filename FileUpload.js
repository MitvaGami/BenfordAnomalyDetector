import React, { useState } from "react";
import axios from "axios";

function FileUpload({ onData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Reset states
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data) {
        onData(res.data);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.error || "Failed to upload file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h3>Upload a CSV file for analysis:</h3>
      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
        disabled={loading}
      />
      {loading && <p>Processing file...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default FileUpload;
