// src/pages/AdminPostsPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, ListGroup, Button, Spinner } from 'react-bootstrap';
import api from '../api';

export default function AdminPostsPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/posts')
      .then(res => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = id => {
    api.delete(`/admin/posts/${id}`)
      .then(() => setPosts(posts.filter(p => p._id !== id)))
      .catch(console.error);
  };

  if (loading) return <Spinner animation="border" className="m-5" />;

  return (
    <Container className="admin-container my-4">
      <h1 className="text-primary text-center mb-4">All Blog Posts</h1>
      {posts.length ? (
        <ListGroup>
          {posts.map(post => (
            <ListGroup.Item key={post._id} className="d-flex justify-content-between align-items-start">
              <div>
                <h5>{post.title}</h5>
                <small className="text-muted">
                  Created by {post.createdBy.username} on {new Date(post.createdAt).toDateString()}
                </small>
              </div>
              <Button variant="danger" size="sm" onClick={()=>handleDelete(post._id)}>
                Delete
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-center text-danger">No posts found.</p>
      )}
    </Container>
  );
}
