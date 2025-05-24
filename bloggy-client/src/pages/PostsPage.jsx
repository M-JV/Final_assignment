// src/pages/PostsPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  ListGroup,
  Badge,
  Alert,
  Spinner,
  Card,
  Form,
  FormControl,
  Button
} from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

const PREVIEW_LENGTH = 50;

export default function PostsPage() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [activeUsers, setActiveUsers]     = useState([])
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Pull “q” from the URL (search panel will put it there)
  const searchTerm = new URLSearchParams(location.search).get('q') || '';

  // Fetch posts (filtered by “q” if present)
  useEffect(() => {
    setLoadingPosts(true);
    (async () => {
      try {
        const url = searchTerm
          ? `/posts?search=${encodeURIComponent(searchTerm)}`
          : '/posts';
        const res = await api.get(url);
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPosts(false);
      }
    })();
  }, [searchTerm]);

  // 2) fetch currently online users
  useEffect(() => {
    setLoadingUsers(true);
    api.get('/users/online')
      .then(res => setActiveUsers(res.data))
      .catch(err => {
        console.error(err);
        setActiveUsers([]);
      })
      .finally(() => setLoadingUsers(false));
  }, []);
  return (
    <Container fluid className="my-5">
      <Row>
        {/* ─── Active Users Panel ───────────────────────── */}
        <Col md={3}>
          <h5>Active Users</h5>
          {loadingUsers ? (
            <Spinner animation="border" />
          ) : activeUsers.length ? (
            <ListGroup>
              {activeUsers.map(u => (
                <ListGroup.Item
                  as={Link}
                  to={`/author/${u._id}`}
                  key={u._id}                   // ← unique key here
                  action
                >
                  {u.username}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="info">No users online</Alert>
          )}
        </Col>

        {/* ─── Posts List with Preview ──────────────────── */}
        <Col md={6}>
          {searchTerm && (
            <p className="text-muted">
              Search results for “{searchTerm}”
            </p>
          )}

          {loadingPosts ? (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          ) : posts.length > 0 ? (
            posts.map(post => {
              const date = new Date(post.createdAt).toLocaleDateString()
              const preview =
                post.content.length > PREVIEW_LENGTH
                  ? post.content.slice(0, PREVIEW_LENGTH) + '…'
                  : post.content

              return (
                <Card className="mb-4" key={post._id}>
                  <Card.Body>
                    <Card.Title>
                      <Link to={`/posts/${post._id}`}>
                        {post.title}
                      </Link>
                    </Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">
                      By{' '}
                      <Link to={`/author/${post.createdBy._id}`}>
                        {post.createdBy.username}
                      </Link>{' '}
                      on {date}
                    </Card.Subtitle>
                    <Card.Text>{preview}</Card.Text>
                    {post.tags?.map(tag => (
                      <Badge
                        bg="secondary"
                        className="me-1"
                        key={tag}
                        as={Link}
                        to={`/posts?q=${encodeURIComponent(tag)}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Card.Body>
                </Card>
              )
            })
          ) : (
            <Alert variant={searchTerm ? 'warning' : 'info'}>
              {searchTerm
                ? `No posts found matching “${searchTerm}.”`
                : 'No posts yet.'}
            </Alert>
          )}

          {user && (
            <Link to="/posts/new" className="btn btn-success">
              Create New Post
            </Link>
          )}
        </Col>

        {/* ─── Search Panel ─────────────────────────────── */}
        <Col md={3}>
          <h5>Search Posts</h5>
          <Form
            onSubmit={e => {
              e.preventDefault()
              const q = e.target.q.value.trim()
              if (q) navigate(`/posts?q=${encodeURIComponent(q)}`)
            }}
          >
            <FormControl
              name="q"
              type="search"
              placeholder="By title or tag"
              className="mb-2"
              defaultValue={searchTerm}
              required
            />
            <Button
              variant="outline-primary"
              type="submit"
              className="w-100"
            >
              🔍 Search
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  )
}