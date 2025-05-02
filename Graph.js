import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register all required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Graph({ data }) {
  if (!data || !data.actual || !data.expected) {
    return <div>No data available to display</div>;
  }

  const chartData = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    datasets: [
      {
        label: "Actual Distribution",
        data: data.actual,
        backgroundColor: "rgba(75,192,192,0.6)",
      },
      {
        label: "Expected (Benford's Law)",
        data: data.expected,
        backgroundColor: "rgba(255,99,132,0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Benford's Law Analysis",
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}

export default Graph;
