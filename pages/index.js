// import { useState } from 'react';
// import axios from 'axios';
// import styles from '../styles/Home.module.css';

// export default function Home() {
//   const [file, setFile] = useState(null);
//   const [response, setResponse] = useState('');
//   const [imageSrc, setImageSrc] = useState(null);
//   const [chartSpec, setChartSpec] = useState(null);

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       alert('Please select a file.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       // Step 1: Upload the file to the Python backend
//       console.log('Uploading file to the Python backend...');
//       const uploadResponse = await axios.post(
//         'http://localhost:5000/upload_csv',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       if (uploadResponse.status === 200) {
//         const base64String = uploadResponse.data.dataframe;
//         console.log('Received base64 encoded DataFrame from Python backend:', base64String);

//         // Step 2: Send the base64 encoded DataFrame to the Flask proxy endpoint (POST request)
//         console.log('Sending base64 encoded DataFrame to Flask proxy endpoint...');
//         const postResponse = await axios.post(
//           'http://localhost:5000/proxy_post',
//           { dataframe: base64String },
//           { headers: { 'Content-Type': 'application/json' } }
//         );

//         if (postResponse.status === 200) {
//           console.log('DataFrame uploaded successfully to Flask proxy endpoint.');

//           // Step 3: Query the Flask proxy endpoint for the plot (GET request)
//           console.log('Sending request to query DataFrame via Flask proxy endpoint...');
//           const queryResponse = await axios.get(
//             'http://localhost:5000/proxy_get',
//             {
//               params: {
//                 input: 'Generate box plots for Core_subjects vs terms',
//                 chart_format: 'simple',
//               },
//             }
//           );

//           if (queryResponse.status === 200) {
//             const responseData = queryResponse.data;
//             console.log('Query response received:', responseData);

//             if (responseData.figure) {
//               const figBytes = Uint8Array.from(
//                 atob(responseData.figure),
//                 (c) => c.charCodeAt(0)
//               );

//               if (responseData.chart_type === 'simple') {
//                 const blob = new Blob([figBytes.buffer], { type: 'image/png' });
//                 const url = URL.createObjectURL(blob);
//                 setImageSrc(url);
//               } else if (responseData.chart_type === 'vega') {
//                 const chartJson = new TextDecoder().decode(figBytes);
//                 const chartSpec = JSON.parse(chartJson);
//                 setChartSpec(chartSpec);
//               }
//             } else {
//               setResponse('Unexpected response format.');
//             }
//           } else {
//             setResponse(`Failed to generate plot or query. Status code: ${queryResponse.status}`);
//           }
//         } else {
//           setResponse(`Failed to upload DataFrame. Status code: ${postResponse.status}`);
//         }
//       } else {
//         setResponse(`Failed to upload DataFrame to Python backend. Status code: ${uploadResponse.status}`);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setResponse('An error occurred while processing your request.');
//     }
//   };

//   return (
//     <div className={styles.uploadContainer}>
//       <form onSubmit={handleSubmit} className={styles.form}>
//         <input type="file" onChange={handleFileChange} className={styles.input} />
//         <button type="submit" className={styles.button}>Upload</button>
//       </form>
//       {response && <p className={styles.response}>{response}</p>}
//       {imageSrc && <img src={imageSrc} alt="Generated Plot" className={styles.image} />}
//       {chartSpec && <pre className={styles.chartSpec}>{JSON.stringify(chartSpec, null, 2)}</pre>}
//     </div>
//   );
// }

import { useState } from 'react';
import axios from 'axios';
import { VegaLite } from 'react-vega';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [chartSpec, setChartSpec] = useState(null);
  const [chartInput, setChartInput] = useState('Generate box plots for Core_subjects vs terms');
  const [chartFormat, setChartFormat] = useState('simple');
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
    setResponse('');
    setImageSrc(null);
    setChartSpec(null);
    setChartInput('Generate box plots for Core_subjects vs terms');
    setChartFormat('simple');
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Upload the file to the Python backend
      console.log('Uploading file to the Python backend...');
      const uploadResponse = await axios.post(
        'upload-and-analyze-csv-backend.vercel.app/upload_csv',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (uploadResponse.status === 200) {
        const base64String = uploadResponse.data.dataframe;
        console.log('Received base64 encoded DataFrame from Python backend:', base64String);

        // Step 2: Send the base64 encoded DataFrame to the Flask proxy endpoint (POST request)
        console.log('Sending base64 encoded DataFrame to Flask proxy endpoint...');
        const postResponse = await axios.post(
          'upload-and-analyze-csv-backend.vercel.app/proxy_post',
          { dataframe: base64String },
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (postResponse.status === 200) {
          console.log('DataFrame uploaded successfully to Flask proxy endpoint.');

          // Step 3: Query the Flask proxy endpoint for the plot (GET request)
          console.log('Sending request to query DataFrame via Flask proxy endpoint...');
          const queryResponse = await axios.get(
            'upload-and-analyze-csv-backend.vercel.app/proxy_get',
            {
              params: {
                input: chartInput,
                chart_format: chartFormat,
              },
            }
          );

          if (queryResponse.status === 200) {
            const responseData = queryResponse.data;
            console.log('Query response received:', responseData);

            if (responseData.figure) {
              const figBytes = Uint8Array.from(
                atob(responseData.figure),
                (c) => c.charCodeAt(0)
              );

              if (responseData.chart_type === 'simple') {
                const blob = new Blob([figBytes.buffer], { type: 'image/png' });
                const url = URL.createObjectURL(blob);
                setImageSrc(url);
              } else if (responseData.chart_type === 'vega') {
                const chartJson = new TextDecoder().decode(figBytes);
                const chartSpec = JSON.parse(chartJson);
                setChartSpec(chartSpec);
              }
            } else {
              setResponse('Unexpected response format.');
            }
          } else {
            setResponse(`Failed to generate plot or query. Status code: ${queryResponse.status}`);
          }
        } else {
          setResponse(`Failed to upload DataFrame. Status code: ${postResponse.status}`);
        }
      } else {
        setResponse(`Failed to upload DataFrame to Python backend. Status code: ${uploadResponse.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload and Analyze CSV</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fileInputContainer}>
          <input type="file" onChange={handleFileChange} className={styles.inputFile} id="fileInput" />
          <label htmlFor="fileInput" className={styles.fileInputLabel}>Choose File</label>
          {file && <span className={styles.fileName}>{file.name}</span>}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="chartInput" className={styles.label}>Chart Input:</label>
          <select id="chartInput" value={chartInput} onChange={handleChartInputChange} className={styles.select}>
            <option value="Generate a bar graph for Core_CNS with respect to terms">Generate a bar graph for Core_CNS with respect to terms</option>
            <option value="Get the average score of all students from all subjects and plot a line graph against terms">Get the average score of all students from all subjects and plot a line graph against terms</option>
            <option value="Generate me a histogram with Student_Id vs Elective_AI marks">Generate me a histogram with Student_Id vs Elective_AI marks</option>
            <option value="Generate a pie chart for all Core_CNS percentage Core_CNS max score for all students">Generate a pie chart for all Core_CNS percentage Core_CNS max score for all students</option>
            <option value="Generate box plots for Core_subjects vs terms">Generate box plots for Core_subjects vs terms</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="chartFormat" className={styles.label}>Chart Format:</label>
          <select id="chartFormat" value={chartFormat} onChange={handleChartFormatChange} className={styles.select}>
            <option value="simple">Simple</option>
            <option value="vega">Vega</option>
          </select>
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button} disabled={loading} style={{display: loading? 'none': ''}}>Upload</button>
          <button type="button" className={styles.buttonReset} onClick={handleReset} disabled={loading}>Reset</button>
        </div>
      </form>
      {loading && <div className={styles.loader}></div>}
      {response && <p className={styles.response}>{response}</p>}
      {imageSrc && <img src={imageSrc} alt="Generated Plot" className={styles.image} />}
      {chartSpec && <VegaLite spec={chartSpec} className={styles.image}/>}
    </div>
  );
}


