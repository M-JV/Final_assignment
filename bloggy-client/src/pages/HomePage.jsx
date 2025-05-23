// src/pages/HomePage.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Spinner
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';
import '../index.css';

export default function HomePage() {
  const { user } = useContext(UserContext);

  // recent posts (exactly as before)
  const [recentPosts, setRecentPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // **new**: active users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // fetch posts
  useEffect(() => {
    api.get('/posts')
      .then(res => setRecentPosts(res.data.slice(0, 3)))
      .catch(console.error)
      .finally(() => setLoadingPosts(false));
  }, []);

  // fetch users (only if logged in)
  useEffect(() => {
    if (!user) return setLoadingUsers(false);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Failed loading users:', err);
        setUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, [user]);

  return (
    <Container fluid className="min-vh-100 pt-5 pb-5">
      <Row className="justify-content-center">
        {/* if logged in, show users panel */}
        {user && (
          <Col md={3} className="mb-4">
            <h5 className="text-secondary">Active Users</h5>
            {loadingUsers ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <ListGroup>
                {users.map(u => (
                  <ListGroup.Item key={u._id} action as={Link} to={`/search?q=${encodeURIComponent(u.username)}`}>
                    {u.username}
                  </ListGroup.Item>
                ))}
                {users.length === 0 && (
                  <ListGroup.Item className="text-muted">
                    No users yet.
                  </ListGroup.Item>
                )}
              </ListGroup>
            )}
          </Col>
        )}

        {/* main content */}
        <Col md={ user ? 9 : 12 }>
          {/* Hero Section */}
          <Container className="text-center hero-section mb-5">
            <h1 className="text-primary mb-2">Welcome to Bloggy ✍️</h1>
            <p className="text-muted mb-4">
              Your creative space for sharing ideas, thoughts, and inspiration.
            </p>
            <div className="d-flex justify-content-center gap-3">
              {!user && (
                <Button as={Link} to="/register" variant="success">
                  🚀 Get Started
                </Button>
              )}
              <Button as={Link} to="/posts" variant="outline-primary">
                📚 View Posts
              </Button>
            </div>
          </Container>

          {/* Why Section */}
          <Container className="why-section mb-5">
            <h3 className="text-center mb-3">Why Bloggy?</h3>
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item className="bg-transparent border-0 text-dark">
                💬 Share your stories
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 text-dark">
                🤝 Connect with like-minded creators
              </ListGroup.Item>
              <ListGroup.Item className="bg-transparent border-0 text-dark">
                🌍 Explore a world of ideas
              </ListGroup.Item>
            </ListGroup>
          </Container>

          {/* Recent Blog Posts */}
          <Container style={{ width: '100%', maxWidth: '1200px' }}>
            <h2 className="text-center mb-4 text-secondary">Recent Blog Posts</h2>
            {loadingPosts ? (
              <div className="text-center my-5">
                <Spinner animation="border" />
              </div>
            ) : recentPosts.length > 0 ? (
              <Row xs={1} md={3} className="g-4">
                {recentPosts.map(post => (
                  <Col key={post._id}>
                    <Card className="h-100 shadow">
                      <Card.Body>
                        <Card.Title className="card-title">
                          {post.title}
                        </Card.Title>
                        <Card.Text className="card-text">
                          {post.content.slice(0, 100)}…
                        </Card.Text>
                      </Card.Body>
                      <Card.Footer className="bg-transparent d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          By {post.createdBy?.username || 'Unknown'}
                        </small>
                        <Button
                          as={Link}
                          to={`/posts/${post._id}`}
                          variant="primary"
                          size="sm"
                        >
                          Read More
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center my-5">
                <p className="text-muted mb-3">
                  No blog posts yet.
                </p>
                {user ? (
                  <Button as={Link} to="/posts/new" variant="success">
                    Write Your First Blog
                  </Button>
                ) : (
                  <Button as={Link} to="/register" variant="success">
                    Be the first to share—Register now!
                  </Button>
                )}
              </div>
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
