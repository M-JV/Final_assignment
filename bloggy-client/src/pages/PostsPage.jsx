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
  Card
} from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function PostsPage() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Pull “q” from the URL (navbar search puts it there)
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

  // Fetch authors list
  useEffect(() => {
    setLoadingUsers(true);
    (async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, []);

  return (
    <Container fluid className="my-5">
      <Row>
        {/* Left‐side authors panel */}
        <Col md={3}>
          <h5>Authors</h5>
          {loadingUsers ? (
            <Spinner animation="border" />
          ) : (
            <ListGroup>
              {users.map(u => (
                <ListGroup.Item
                  key={u._id}
                  action
                  as={Link}
                  to={`/author/${u._id}`}
                >
                  {u.username}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        {/* Main posts list */}
        <Col md={9}>
          {searchTerm && (
            <p className="text-muted">
              Search results for “{searchTerm}”
            </p>
          )}

          {loadingPosts ? (
            <Spinner animation="border" />
          ) : posts.length > 0 ? (
            posts.map(post => {
              const createdAt = new Date(post.createdAt)
                .toLocaleDateString();
              const preview = post.content.length > 150
                ? post.content.slice(0, 150) + '…'
                : post.content;
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
                      on {createdAt}
                    </Card.Subtitle>
                    <Card.Text>{preview}</Card.Text>
                    {post.tags?.length > 0 && (
                      <>
                        {post.tags.map(tag => (
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
                      </>
                    )}
                  </Card.Body>
                </Card>
              );
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
      </Row>
    </Container>
  );
}
