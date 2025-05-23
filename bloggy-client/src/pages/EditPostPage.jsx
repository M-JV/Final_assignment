// src/pages/EditPostPage.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle]     = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Fetch the existing post
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await api.get(`/posts/${id}`);
        setTitle(res.data.title);
        setContent(res.data.content);
        setTags((res.data.tags || []).join(', '));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load post.');
      }
    }
    fetchPost();
  }, [id]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/posts/${id}`, {
        title,
        content,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t)
      });
      setSuccess('Post updated successfully! Redirecting…');
      setTimeout(() => navigate(`/posts/${id}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post.');
    }
  };

  return (
    <Container className="form-container my-5">
      <h1 className="text-primary text-center mb-4">Edit Post</h1>

      {error   && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
            rows={6}
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
            placeholder="e.g. react, javascript, tutorials"
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100">
          Update Post
        </Button>
      </Form>
    </Container>
  );
}
