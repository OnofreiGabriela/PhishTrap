import React, { useState } from 'react';
import axios from '../api/api';
import { useNavigate } from 'react-router-dom';

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
        api_key: apiKey
      });

      if (response.data.success) {
        alert('Configuration saved successfully!');
        navigate('/');  // Redirect to dashboard
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
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Enter Your Credentials</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>API Key:</label><br />
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        {error && (
          <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>
        )}
        <button
          type="submit"
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            width: '100%'
          }}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save and Continue'}
        </button>
      </form>
    </div>
  );
};

export default Login;
