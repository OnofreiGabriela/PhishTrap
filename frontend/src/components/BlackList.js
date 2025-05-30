import React, { useEffect, useState, useCallback } from 'react';
import axios from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const BlackList = () => {
  const [blackList, setBlackList] = useState([]);

  const fetchBlackList = useCallback(async () => {
    try {
      const response = await axios.get('/get-blacklist');
      setBlackList(response.data);
    } catch (error) {
      console.error('Failed to load blacklist:', error);
    }
  }, []);

  const removeFromBlacklist = async (sender, ip) => {
    if (!window.confirm('Are you sure you want to remove this sender from the blacklist?')) return;
    try {
      await axios.post('/remove-from-blacklist', { sender, ip });
      fetchBlackList();
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
    }
  };

  useEffect(() => {
    fetchBlackList();
  }, [fetchBlackList]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Blacklisted Senders</h2>
      {blackList.length === 0 ? (
        <div className="alert alert-info text-center">No blacklisted senders.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Sender</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blackList.map((item, index) => (
                <tr key={index}>
                  <td>{item.sender}</td>
                  <td>{item.ip}</td>
                  <td>
                    <button
                      onClick={() => removeFromBlacklist(item.sender, item.ip)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlackList;
