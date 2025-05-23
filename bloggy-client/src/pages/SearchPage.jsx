// src/pages/SearchPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Container, ListGroup, Badge, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function SearchPage() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchTerm(q);

    (async () => {
      try {
        // ← call /api/posts?search=
        const res = q
          ? await api.get(`posts?search=${encodeURIComponent(q)}`)
          : await api.get('posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error fetching search results');
      }
    })();
  }, [location.search]);

  return (
    <Container className="my-5">
      <h1 className="text-primary text-center mb-3">Search Results</h1>
      <p className="text-center text-muted mb-4">
        {searchTerm
          ? `Results for "${searchTerm}"`
          : 'Enter a term to search posts.'}
      </p>

      {error && <Alert variant="danger">{error}</Alert>}

      {posts.length > 0 ? (
        <ListGroup>
          {posts.map(post => {
            const authorName = post.createdBy?.username || 'Unknown';
            const createdAt = new Date(post.createdAt).toLocaleDateString();

            return (
              <ListGroup.Item key={post._id}>
                <h5>
                  <Link to={`/posts/${post._id}`}>{post.title}</Link>
                </h5>
                <small className="text-muted">
                  Created by {authorName} on {createdAt}
                </small>
                {post.tags?.length > 0 && (
                  <div className="mt-2">
                    {post.tags.map(tag => (
                      <Link
                        key={tag}
                        to={`/search?q=${encodeURIComponent(tag)}`}
                      >
                        <Badge bg="secondary" className="mx-1">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      ) : (
        <Alert variant={searchTerm ? 'warning' : 'info'} className="text-center">
          {searchTerm
            ? `No posts found matching "${searchTerm}".`
            : 'No posts to display.'}
        </Alert>
      )}

      {user && (
        <div className="text-center mt-4">
          <Link to="/posts/new" className="btn btn-success">
            Create New Post
          </Link>
        </div>
      )}
    </Container>
  );
}
