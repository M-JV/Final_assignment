// src/pages/AdminPostsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  // fetch once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('admin/posts'); // → GET /api/admin/posts
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching posts');
      }
    })();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`admin/posts/${id}`); // → DELETE /api/admin/posts/:id
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting post');
    }
  };

  return (
    <Container className="my-5">
      <h1 className="text-center text-primary mb-4">All Blog Posts</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {posts.length > 0 ? (
        <ListGroup>
          {posts.map(p => (
            <ListGroup.Item key={p._id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{p.title}</h5>
                  <small className="text-muted">
                    By {p.createdBy?.username || 'Unknown'} on{' '}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div>
                  <Link to={`/posts/${p._id}`} className="btn btn-info me-2">
                    View
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <Alert variant="info" className="text-center">
          No posts found.
        </Alert>
      )}
    </Container>
  );
}
