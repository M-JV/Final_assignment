// src/components/layout/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  NavDropdown,
  Image
} from 'react-bootstrap';
import { Bell } from 'react-bootstrap-icons';
import { UserContext } from '../../context/UserContext';

export default function AppNavbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'GET', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  return (
    <BSNavbar expand="lg" variant="light" className="shadow-sm sticky-top custom-navbar">
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/" className="navbar-brand">
          Bloggy ✨
        </BSNavbar.Brand>
        <BSNavbar.Toggle />
        <BSNavbar.Collapse>
          {/* Left side links */}
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/posts">All Posts</Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/subscriptions">Subscriptions</Nav.Link>
            )}
          </Nav>

          {/* Right side */}
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                {/* 🔔 Notification bell with badge */}
                <NavDropdown
                  title={
                    <span className="position-relative">
                      <Bell size={20} style={{ cursor: 'pointer' }} />
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.6rem' }}
                      >
                        3
                      </span>
                    </span>
                  }
                  id="nav-notifications"
                  align="end"
                  menuVariant="light"
                  className="me-3"
                >
                  {/* Replace with your real notifications */}
                  <NavDropdown.Item disabled>
                    No new notifications
                  </NavDropdown.Item>
                </NavDropdown>

                {/* New Post */}
                <Nav.Link as={Link} to="/posts/new" className="text-success">
                  ➕ New Post
                </Nav.Link>

                {/* Admin links */}
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

                {/* User dropdown (name + optional avatar) */}
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center">
                      {user.profileImage && (
                        <Image
                          src={user.profileImage}
                          roundedCircle
                          width={24}
                          height={24}
                          className="me-1"
                        />
                      )}
                      {user.username}
                    </span>
                  }
                  id="nav-user-menu"
                  align="end"
                  menuVariant="light"
                >
                  <NavDropdown.Item as={Link} to={`/author/${user.id}`}>
                    My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    ⏏ Logout
                  </NavDropdown.Item>
                </NavDropdown>
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
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
