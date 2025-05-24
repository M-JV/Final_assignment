// src/components/layout/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
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
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          Bloggy ✨
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/posts">All Posts</Nav.Link>
                       {user && (
                <Nav.Link as={Link} to="/subscriptions">
                  Subscriptions
                </Nav.Link>
              )}
          </Nav>

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
                <Nav.Link
                  as="button"
                  onClick={handleLogout}
                  className="text-danger btn btn-link"
                >
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
