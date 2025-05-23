// src/pages/AdminUsersPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Container, ListGroup, Button, Spinner } from 'react-bootstrap';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = id => {
    api.delete(`/admin/users/${id}`)
      .then(() => setUsers(users.filter(u => u._id !== id)))
      .catch(console.error);
  };

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container className="admin-container my-4">
      <h1 className="text-primary text-center mb-4">All Users</h1>
      {users.length ? (
        <ListGroup>
          {users.map(u => (
            <ListGroup.Item key={u._id} className="d-flex justify-content-between align-items-center">
              <div>
                <h5>{u.username}</h5>
                <small className="text-muted">
                  Admin Status: {u.isAdmin ? '✅ Yes' : '❌ No'}
                </small>
              </div>
              {u._id !== user?._id && (
                <Button variant="danger" size="sm" onClick={()=>handleDelete(u._id)}>
                  Delete
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-center text-danger">No users found.</p>
      )}
    </Container>
  );
}
