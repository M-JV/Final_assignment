// src/pages/SearchPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, ListGroup, Spinner } from 'react-bootstrap';
import api from '../api';

export default function SearchPage() {
  const { search } = useLocation();                  // e.g. ?q=foo
  const q = new URLSearchParams(search).get('q') || '';
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/search?q=${encodeURIComponent(q)}`)
      .then(res => setPosts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <Container className="search-results-container my-4">
      <h1 className="text-primary text-center mb-3">Search Results</h1>
      <p className="text-muted text-center mb-4">Results for "{q}"</p>
      {loading ? (
        <Spinner animation="border" />
      ) : posts.length ? (
        <ListGroup>
          {posts.map(post => (
            <ListGroup.Item key={post._id}>
              <h5><Link to={`/posts/${post._id}`}>{post.title}</Link></h5>
              <p className="text-muted">By {post.createdBy.username}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-danger text-center">No posts found.</p>
      )}
    </Container>
  );
}
