// src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react'
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import { UserContext } from '../context/UserContext'

export default function LoginPage() {
  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // show a one‐time success message if redirected here
  useEffect(() => {
    if (location.state?.success) {
      setError(location.state.success)
      navigate(location.pathname, { replace: true, state: {} })
      const tid = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(tid)
    }
  }, [location, navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { username, password })
      setUser(res.data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Error logging in')
    } finally {
      setLoading(false)
    }
  }

  // we defined this in vite.config.js → define
  const googleAuthUrl = `${import.meta.env.VITE_API_BASE}/api/auth/google`

  return (
    <Container className="form-container my-5" style={{ maxWidth: 400 }}>
      <h1 className="text-center mb-4">Login</h1>

      {/* Google OAuth */}
      <Button
        variant="outline-primary"
        href={googleAuthUrl}
        className="w-100 mb-3 d-flex align-items-center justify-content-center"
      >
        <img
          src="https://www.svgrepo.com/show/355037/google.svg"
          alt="Google"
          style={{ width: 20, marginRight: 8 }}
        />
        Sign in with Google
      </Button>

      <hr />

      {/* Local login form */}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100"
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Log In'}
        </Button>
      </Form>
    </Container>
  )
}
