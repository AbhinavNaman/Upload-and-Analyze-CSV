import { useState } from "react";
import axios from "axios";
import { VegaLite } from "react-vega";
import styles from "../styles/Home.module.css";
import ChartSVG from "../components/ChartSVG";

export default function Home() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [chartSpec, setChartSpec] = useState(null);
  const [chartInput, setChartInput] = useState(
    "Generate box plots for Core_subjects vs terms"
  );
  const [chartFormat, setChartFormat] = useState("simple");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChartInputChange = (e) => {
    setChartInput(e.target.value);
  };

  const handleChartFormatChange = (e) => {
    setChartFormat(e.target.value);
  };

  const handleReset = () => {
    setFile(null);
    setResponse("");
    setImageSrc(null);
    setChartSpec(null);
    setChartInput("Generate box plots for Core_subjects vs terms");
    setChartFormat("simple");
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("Uploading file to the Python backend...");
      const uploadResponse = await axios.post(
        "https://upload-and-analyze-csv-backend.onrender.com/proxy_post",
        // "http://localhost:5000/proxy_post",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (uploadResponse.status === 200) {
        const base64String = uploadResponse.data.dataframe;
        console.log(
          "Received base64 encoded DataFrame from Python backend:",
          base64String
        );

        setResponse("File uploaded successfully.");
      } else {
        setResponse(
          `Failed to upload DataFrame to Python backend. Status code: ${uploadResponse.status}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while uploading the file.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChart = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      console.log(
        "Sending request to query DataFrame via Flask proxy endpoint..."
      );
      const queryResponse = await axios.get(
        "https://upload-and-analyze-csv-backend.onrender.com/proxy_get",
        // "http://localhost:5000/proxy_get",
        {
          params: {
            input: chartInput,
            chart_format: chartFormat,
          },
        }
      );

      if (queryResponse.status === 200) {
        const responseData = queryResponse.data;
        console.log("Query response received:", responseData);

        if (responseData.figure) {
          const figBytes = Uint8Array.from(atob(responseData.figure), (c) =>
            c.charCodeAt(0)
          );

          if (responseData.chart_type === "simple") {
            const blob = new Blob([figBytes.buffer], { type: "image/png" });
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
          } else if (responseData.chart_type === "vega") {
            const chartJson = new TextDecoder().decode(figBytes);
            const chartSpec = JSON.parse(chartJson);
            setChartSpec(chartSpec);
          }
        } else {
          setResponse("Unexpected response format.");
        }
      } else {
        setResponse(
          `Failed to generate plot or query. Status code: ${queryResponse.status}`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while generating the chart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ flex: "1" }}>
        <h1 className={styles.title}>LLM Dashboard</h1>
        <form className={styles.form}>
          <div className={styles.fileInputContainer}>
            <input
              type="file"
              onChange={handleFileChange}
              className={styles.inputFile}
              id="fileInput"
            />
            <label htmlFor="fileInput" className={styles.fileInputLabel}>
              Choose File
            </label>
            {file && <span className={styles.fileName}>{file.name}</span>}
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="chartInput" className={styles.label}>
              Chart Input:
            </label>
            <textarea
              id="chartInput"
              value={chartInput}
              onChange={handleChartInputChange}
              className={styles.textArea}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="chartFormat" className={styles.label}>
              Chart Format:
            </label>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  value="simple"
                  checked={chartFormat === "simple"}
                  onChange={handleChartFormatChange}
                  className={styles.radio}
                />
                Simple
              </label>
              <label>
                <input
                  type="radio"
                  value="vega"
                  checked={chartFormat === "vega"}
                  onChange={handleChartFormatChange}
                  className={styles.radio}
                />
                Vega
              </label>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.button}
              onClick={handleUpload}
              disabled={loading}
              style={{ display: loading ? "none" : "" }}
            >
              Upload
            </button>
            <button
              type="button"
              className={styles.button}
              onClick={handleGenerateChart}
              disabled={loading}
              style={{ display: loading ? "none" : "" }}
            >
              Generate Chart
            </button>
            <button
              type="button"
              className={styles.buttonReset}
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
        {loading && <div className={styles.loader}></div>}
      </div>
      <div style={{ flex: "1" }}>
        {response && <p className={styles.response}>{response}</p>}
        {imageSrc && (
          <img src={imageSrc} alt="Generated Plot" className={styles.image} />
        )}
        {chartSpec && <VegaLite spec={chartSpec} className={styles.image} />}
        {!imageSrc && !chartSpec && <ChartSVG />}
      </div>
    </div>
  );
}
