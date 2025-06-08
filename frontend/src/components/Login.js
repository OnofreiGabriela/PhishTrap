import React, { useState } from 'react';
import axios from '../api/api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/save-config', {
        email,
        api_key: apiKey,
      });

      if (response.data.success) {
        alert('Configuration saved successfully!');
        navigate('/'); // Redirect to dashboard
        window.location.reload();
      } else {
        setError('Failed to save configuration.');
      }
    } catch (err) {
      console.error('Error saving config:', err);
      setError('An error occurred while saving the configuration.');
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Enter Your Credentials</h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">API Key</label>
          <input
            type="password"
            className="form-control"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            placeholder="Your API Key"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save and Continue'}
        </button>

      <div className="mt-3 alert alert-info small text-center">
        <strong>Disclaimer:</strong> This is a demo version of <em>PhishTrap</em>, intended for educational and development purposes only. <br />
        You may log in using any email and API key combination. However, to use the core features—reading emails from the past 24 hours and sending bait responses to potential phishing attackers, you must provide a <strong>valid, functional email address</strong> with access to a real mailbox. <br />
        Fake credentials can be submitted for demonstration purposes, but email fetching and bait functionality will not be available. <br />
        All credentials are stored locally in an encrypted <code>config.json</code> file using <code>cryptography.Fernet</code>. No external storage, backend authentication, or user verification is performed.
      </div>
      </form>
    </div>
  );
};

export default Login;
