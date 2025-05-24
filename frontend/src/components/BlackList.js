import React, { useEffect, useState } from 'react';
import axios from '../api/api';

const BlackList = () => {
  const [blackList, setBlackList] = useState([]);

  const fetchBlackList = async () => {
    try {
      const response = await axios.get('/get-blacklist');
      setBlackList(response.data);
    } catch (error) {
      console.error('Failed to load blacklist:', error);
    }
  };

  const removeFromBlacklist = async (sender, ip) => {
    try {
      await axios.post('/remove-from-blacklist', { sender, ip });
      fetchBlackList();  // Refresh after removal
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
    }
  };

  useEffect(() => {
    fetchBlackList();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Blacklisted Senders</h2>
      {blackList.length === 0 ? (
        <p>No blacklisted senders.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px' }}>Sender</th>
              <th style={{ padding: '8px' }}>IP Address</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blackList.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '8px' }}>{item.sender}</td>
                <td style={{ padding: '8px' }}>{item.ip}</td>
                <td style={{ padding: '8px' }}>
                  <button
                    onClick={() => removeFromBlacklist(item.sender, item.ip)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BlackList;
