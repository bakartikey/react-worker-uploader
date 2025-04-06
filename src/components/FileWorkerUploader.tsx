import React, { useState } from 'react';
import { useWorkerUploader } from '../hooks/useWorkerUploader';

const FileWorkerUploader: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { parseFile, loading } = useWorkerUploader({
    onParsed: (parsedData) => {
      setData(parsedData);
      setError(null);
    },
    onError: (err) => {
      setError(err);
      alert(err);
    },
    onStart: () => {
      console.log('Parsing started');
    },
    onFinish: () => {
      console.log('Done 🎉');
    },
    fileType: 'csv',
    allowedExtensions: ['csv'],
    maxFileSizeMB: 10,
    parseOptions: {
      delimiter: ',',
      lineBreak: '\n',
    },
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h3>📁 Upload CSV / JSON file</h3>
      <input type="file" accept=".csv,.json" onChange={handleFileChange} />
      {loading && <p>Processing file…</p>}
      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}
      {data.length > 0 && (
        <div>
          <h4>✅ Parsed Result:</h4>
          <pre>{JSON.stringify(data.slice(0, 5), null, 2)}</pre>
          {data.length > 5 && <p>...and {data.length - 5} more rows</p>}
        </div>
      )}
    </div>
  );
};

export default FileWorkerUploader;
