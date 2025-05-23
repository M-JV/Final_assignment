// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Badge, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`posts/${id}`);  // GET /api/posts/:id
        setPost(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching post');
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`posts/${id}`);         // DELETE /api/posts/:id
      navigate('/posts');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting post');
    }
  };

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="my-5 text-center">
        <p>Loading...</p>
      </Container>
    );
  }

  const authorName = post.createdBy?.username || 'Unknown';
  const createdAt  = new Date(post.createdAt).toDateString();

  return (
    <Container className="my-5">
      <Card className="mx-auto shadow" style={{ maxWidth: '800px' }}>
        <Card.Body>
          <Card.Title as="h1" className="text-primary mb-3">
            {post.title}
          </Card.Title>

          <Card.Text className="mb-4">
            {post.content}
          </Card.Text>

          <div className="mb-3 text-muted">
            Created by <strong>{authorName}</strong> on {createdAt}
          </div>

          {post.tags?.length > 0 && (
            <div className="mb-4">
              {post.tags.map(tag => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
                  <Badge bg="info" className="me-1">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {user?.id === post.createdBy?._id && (
            <div className="d-flex">
              <Link to={`/posts/${id}/edit`} className="btn btn-primary me-2">
                Edit
              </Link>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
