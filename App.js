import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import Graph from "./components/Graph";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleData = async (result) => {
    setData(result);

    if (!result || !result.anomalies) {
      setError("Invalid data received from analysis");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post("http://localhost:5000/explain", {
        anomalies: result.anomalies,
      });

      if (res.data && res.data.explanation) {
        setExplanation(res.data.explanation);
      }
    } catch (err) {
      console.error("Explanation error:", err);
      setError("Failed to generate explanation. API may be unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="App"
      style={{ padding: 20, maxWidth: "800px", margin: "0 auto" }}
    >
      <h1>Benford's Law Anomaly Detector</h1>
      <p>
        Upload a CSV file to analyze number distributions according to Benford's
        Law, which predicts that in many naturally occurring collections of
        numbers, the leading digit is likely to be small.
      </p>

      <FileUpload onData={handleData} />

      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}

      {data && (
        <div style={{ marginTop: 20 }}>
          <h2>Analysis Results</h2>
          <Graph data={data} />

          <div style={{ marginTop: 20 }}>
            <h3>Anomaly Details:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Digit
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Actual
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Expected
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Deviation
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.anomalies.map((item) => (
                  <tr key={item.digit}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {item.digit}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {(item.actual * 100).toFixed(2)}%
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {(item.expected * 100).toFixed(2)}%
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                      {(item.deviation * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {loading && <p>Generating explanation...</p>}

      {explanation && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#f5f5f5",
            borderRadius: 5,
          }}
        >
          <h3>AI Analysis:</h3>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}

export default App;
