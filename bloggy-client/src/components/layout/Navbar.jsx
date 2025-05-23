// src/components/layout/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Nav,
  Container,
  Form,
  FormControl,
  Button
} from 'react-bootstrap';
import { UserContext } from '../../context/UserContext';

export default function AppNavbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate          = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  return (
    <Navbar expand="lg" variant="light" className="shadow-sm sticky-top custom-navbar">
      <Container fluid className="position-relative">
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          Bloggy ✨
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/posts">All Posts</Nav.Link>
          </Nav>

          {/* Centered search bar */}
          <Form
            onSubmit={e => {
              e.preventDefault();
              const q = e.target.q.value.trim();
              if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
            }}
            className="d-flex position-absolute start-50 translate-middle-x"
          >
            <FormControl name="q" type="search" placeholder="Search..." className="me-2" required />
            <Button variant="outline-dark" type="submit">🔍</Button>
          </Form>

          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                <Nav.Link as={Link} to="/posts/new" className="text-success">
                  ➕ New Post
                </Nav.Link>
                {user.isAdmin && (
                  <>
                    <Nav.Link as={Link} to="/admin/posts" className="text-danger">
                      🛠 Admin Posts
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/users" className="text-danger">
                      🔧 Admin Users
                    </Nav.Link>
                  </>
                )}
                <Nav.Link className="text-primary fw-bold">
                  👤 {user.username}
                </Nav.Link>
                <Nav.Link as="button" onClick={handleLogout} className="text-danger btn btn-link">
                  ⏏ Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-info">
                  🔐 Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-info">
                  📝 Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
