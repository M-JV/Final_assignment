// src/pages/NewPostPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewPostPage() {
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags]       = useState('');
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post(
        'posts',       // ← no leading slash, so url becomes /api/posts
        {
          title,
          content,
          tags: tags
            .split(',')
            .map(t => t.trim())
            .filter(t => t),
        }
      );
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    }
  };

  return (
    <Container className="form-container my-5" style={{ maxWidth: 600 }}>
      <h1 className="text-primary text-center mb-4">Create New Post</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="title" className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="content" className="mb-3">
          <Form.Label>Content</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={content}
            onChange={e => setContent(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="tags" className="mb-3">
          <Form.Label>Tags (comma-separated)</Form.Label>
          <Form.Control
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          Create Post
        </Button>
      </Form>
    </Container>
  );
}
