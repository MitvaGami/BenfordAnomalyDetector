const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const benford = require("./benford");

// Load environment variables
dotenv.config();

const app = express();

// Configure file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "text/csv") {
      return cb(new Error("Only CSV files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const values = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      for (let key in row) {
        const val = parseFloat(row[key]);
        if (!isNaN(val)) values.push(val);
      }
    })
    .on("error", (error) => {
      console.error("Error parsing CSV:", error);
      fs.unlinkSync(filePath);
      return res.status(500).json({ error: "Failed to parse CSV file" });
    })
    .on("end", () => {
      // Clean up the uploaded file
      fs.unlinkSync(filePath);

      if (values.length === 0) {
        return res
          .status(400)
          .json({ error: "No valid numerical data found in CSV" });
      }

      try {
        const result = benford.analyze(values);
        res.json(result);
      } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({ error: "Failed to analyze data" });
      }
    });
});

// AI explanation endpoint - Using local analysis only
app.post("/explain", async (req, res) => {
  const { anomalies } = req.body;

  if (!anomalies || !Array.isArray(anomalies)) {
    return res.status(400).json({ error: "Invalid anomaly data" });
  }

  // Generate detailed explanation without using OpenAI
  try {
    // Sort anomalies by deviation to find most significant ones
    const sortedAnomalies = [...anomalies].sort(
      (a, b) => b.deviation - a.deviation
    );
    const highestDeviation = sortedAnomalies[0];

    // Calculate average deviation
    const avgDeviation =
      anomalies.reduce((sum, a) => sum + a.deviation, 0) / anomalies.length;

    // Calculate how well the data follows Benford's Law
    const followsBenford = avgDeviation < 0.03; // 3% threshold

    // Generate explanation
    let explanation = "Based on Benford's Law analysis:\n\n";

    // Overall assessment
    if (followsBenford) {
      explanation +=
        "The data appears to generally follow Benford's Law, with an average deviation of " +
        (avgDeviation * 100).toFixed(2) +
        "%. This suggests the dataset likely represents naturally occurring numbers.\n\n";
    } else {
      explanation +=
        "The data shows notable deviations from Benford's Law, with an average deviation of " +
        (avgDeviation * 100).toFixed(2) +
        "%. This could indicate potential anomalies in the dataset.\n\n";
    }

    // Most significant deviation
    explanation +=
      "The most significant deviation was found for digit " +
      highestDeviation.digit +
      ", with an actual frequency of " +
      (highestDeviation.actual * 100).toFixed(2) +
      "% versus the expected " +
      (highestDeviation.expected * 100).toFixed(2) +
      "%.\n\n";

    // Interpretation
    if (highestDeviation.deviation > 0.1) {
      // 10% threshold for significant deviation
      explanation +=
        "This large deviation could indicate:\n" +
        "- Potential data manipulation or selection bias\n" +
        "- A dataset that doesn't naturally follow Benford's Law (like assigned numbers)\n" +
        "- Insufficient sample size for reliable analysis\n\n";
    } else {
      explanation +=
        "This pattern is consistent with what we would expect from:\n" +
        "- Financial data (transactions, account balances)\n" +
        "- Population figures\n" +
        "- Physical constants and measurements\n" +
        "- Many other naturally occurring datasets\n\n";
    }

    // Add educational information about Benford's Law
    explanation +=
      "About Benford's Law:\n" +
      "Benford's Law predicts that in many naturally occurring collections of numbers, the leading digit is likely " +
      "to be small. Specifically, digit 1 appears about 30% of the time, while digit 9 appears less than 5%. " +
      "This pattern emerges in datasets that span multiple orders of magnitude and has applications in fraud detection " +
      "and data quality assessment.";

    // Small delay to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    res.json({
      explanation: explanation,
      source: "local",
    });
  } catch (err) {
    console.error("Analysis error:", err);
    res.status(500).json({
      error: "Failed to generate explanation",
      details: err.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || "Something went wrong!",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
