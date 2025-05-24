// src/components/layout/Navbar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate }             from 'react-router-dom';
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
  Image
} from 'react-bootstrap';
import { Bell }                         from 'react-bootstrap-icons';
import { io }                           from 'socket.io-client';
import dayjs                            from 'dayjs';
import relativeTime                     from 'dayjs/plugin/relativeTime';
import api                              from '../../api';
import { UserContext }                  from '../../context/UserContext';

dayjs.extend(relativeTime);

export default function AppNavbar() {
  const { user, setUser } = useContext(UserContext);
  const navigate          = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unseenCount,    setUnseenCount]  = useState(0);

  // Fetch missed notifications on login
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnseenCount(0);
      return;
    }
    api.get('/notifications')
      .then(res => {
        setNotifications(res.data);
        setUnseenCount(res.data.filter(n => !n.seen).length);
      })
      .catch(console.error);
  }, [user]);

  // Socket.io real-time hookup
  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_BASE, { withCredentials: true });
    socket.on('new_post', notif => {
    console.log('🔔 NEW_POST notification received:', notif);
      setNotifications(prev => [{
        ...notif,
        seen: false
      }, ...prev]);
      setUnseenCount(c => c + 1);
    });
    return () => socket.disconnect();
  }, [user]);

  // Mark all as seen when dropdown opens
  const handleMarkSeen = () => {
    api.patch('/notifications/mark-seen')
      .then(() => setUnseenCount(0))
      .catch(console.error);
  };

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
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/posts">All Posts</Nav.Link>
            {user && <Nav.Link as={Link} to="/subscriptions">Subscriptions</Nav.Link>}
          </Nav>
          <Nav className="ms-auto align-items-center">
            {user ? (
              <>
                {/* 🔔 notifications */}
                <NavDropdown
                  title={
                    <span className="position-relative">
                      <Bell size={20} style={{ cursor: 'pointer' }} />
                      {unseenCount > 0 && (
                        <Badge
                          bg="danger"
                          pill
                          className="position-absolute top-0 start-100 translate-middle"
                          style={{ fontSize: '0.6rem' }}
                        >
                          {unseenCount}
                        </Badge>
                      )}
                    </span>
                  }
                  id="nav-notifs"
                  align="end"
                  onToggle={open => open && handleMarkSeen()}
                >
                  {notifications.length === 0 ? (
                    <NavDropdown.Item disabled>No notifications</NavDropdown.Item>
                  ) : notifications.map((n, i) => (
                    <NavDropdown.Item
                      key={i}
                      as={Link}
                      to={`/posts/${n.postId}`}
                    >
                      <div><strong>{n.title}</strong> by {n.author}</div>
                      <small className="text-muted">{dayjs(n.createdAt).fromNow()}</small>
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>

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
                  id="nav-user"
                  align="end"
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
                <Nav.Link as={Link} to="/login"    className="text-info">🔐 Login</Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-info">📝 Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
