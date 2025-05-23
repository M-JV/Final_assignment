// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../index.css';  // ensure your global & component styles are loaded

export default function RegisterPage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    try {
      const { data } = await api.post('/auth/register', { username, password });
      // pass `success` so LoginPage reads it from location.state.success
      navigate('/login', { state: { success: data.message } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="form-container my-5">
      <h1 className="text-primary text-center mb-4">Register</h1>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            name="username"
            type="text"
            placeholder="Enter username"
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            placeholder="Enter password"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 mt-3">
          Register
        </Button>
      </Form>
    </div>
  );
}
