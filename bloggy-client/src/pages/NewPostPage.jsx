// src/pages/NewPostPage.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewPostPage() {
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError]         = useState('');
  const navigate                   = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Turn the comma-separated string into a real array
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      await api.post('posts', {
        title,
        content,
        // only send tags if there’s at least one
        ...(tags.length > 0 && { tags })
      });
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
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="e.g. react, javascript, webdev"
          />
          <Form.Text className="text-muted">
            Optional—enter each tag separated by commas.
          </Form.Text>
        </Form.Group>

        <Button variant="success" type="submit" className="w-100">
          Create Post
        </Button>
      </Form>
    </Container>
  );
}
