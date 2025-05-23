// src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Form, Button, Container, Alert }      from 'react-bootstrap';
import { useNavigate, useLocation }            from 'react-router-dom';
import api                                     from '../api';
import { UserContext }                         from '../context/UserContext';

export default function LoginPage() {
  const { setUser } = useContext(UserContext);
  const navigate    = useNavigate();
  const location    = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // If a success message was passed via navigate state, show it once
  useEffect(() => {
    if (location.state?.success) {
      setSuccess(location.state.success);
      // clear it so it doesn't reappear on back/refresh
      navigate(location.pathname, { replace: true, state: {} });
      // auto-dismiss after 5s
      const tid = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(tid);
    }
  }, [location, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // call JSON API under /api proxy
      const res = await api.post('/auth/login', { username, password });
      // unwrap the user object
      setUser(res.data.user);
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message
          ? err.response.data.message
          : 'Login failed – please try again'
      );
    }
  };

  return (
    <Container className="form-container my-5" style={{ maxWidth: '400px' }}>
      <h1 className="text-primary text-center mb-4">Login</h1>

      {success && <Alert variant="success">{success}</Alert>}
      {error   && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100">
          Login
        </Button>
      </Form>
    </Container>
  );
}
