// src/pages/AdminUsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';
import api from '../api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('admin/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching users');
      }
    })();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <Container className="my-5">
      <h1 className="text-primary text-center mb-4">All Users</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {users.length > 0 ? (
        <ListGroup>
          {users.map(u => (
            <ListGroup.Item key={u._id} className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{u.username}</strong> ({u._id})
              </div>
              <Button
                variant="danger"
                onClick={() => handleDelete(u._id)}
              >
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info" className="text-center">
          No users found.
        </Alert>
      )}
    </Container>
  );
}
