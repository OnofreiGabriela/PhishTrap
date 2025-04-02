import React, { useState } from 'react';
import axios from '../api/api';

const Dashboard = () => {
  const [content, setContent] = useState('');
  const [result, setResult] = useState(null);

  const checkEmail = async () => {
    const response = await axios.post('/email/check', { content });
    setResult(response.data.phishing);
  };

  return (
    <div>
      <h2>Email Phishing Checker</h2>
      <textarea
        rows={10}
        cols={50}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder='Paste email content here...'
      />
      <br />
      <button onClick={checkEmail}>Check</button>
      {result !== null && (
        <p>
          {result ? '⚠️ Phishing Detected!' : '✅ Email Appears Safe'}
        </p>
      )}
    </div>
  );
};

export default Dashboard;
