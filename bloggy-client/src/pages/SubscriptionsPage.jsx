import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  ListGroup,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function SubscriptionsPage() {
  const { user }    = useContext(UserContext);
  const [authors,   setAuthors]  = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get('/users/me/following')      // ← correct endpoint
      .then(res => setAuthors(res.data))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Error loading subscriptions');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleUnsubscribe = async authorId => {
    try {
      await api.post(`/users/${authorId}/unfollow`);
      setAuthors(curr => curr.filter(a => a._id !== authorId));
    } catch (err) {
      console.error(err);
      alert('Could not unsubscribe.');
    }
  };

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Please <Link to="/login">log in</Link> to view your subscriptions.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="my-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">My Subscriptions</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {authors.length === 0 ? (
        <Alert variant="info">
          You’re not subscribed to anyone yet. <Link to="/posts">Browse posts &rarr;</Link>
        </Alert>
      ) : (
        <ListGroup>
          {authors.map(a => (
            <ListGroup.Item
              key={a._id}
              className="d-flex justify-content-between align-items-center"
            >
              <Link to={`/author/${a._id}`}>{a.username}</Link>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => handleUnsubscribe(a._id)}
              >
                Unsubscribe
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}
