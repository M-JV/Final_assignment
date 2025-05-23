// src/pages/PostsPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Container, ListGroup, Badge, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function PostsPage() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchTerm(q);
    (async () => {
      try {
        const res = q
          ? await api.get(`posts?search=${encodeURIComponent(q)}`)
          : await api.get('posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [location.search]);

  return (
    <Container className="posts-container my-5">
      <h1 className="text-center text-primary mb-4">All Posts</h1>

      {searchTerm && (
        <p className="text-muted">
          Search results for "{searchTerm}"
        </p>
      )}

      {posts.length > 0 ? (
        <ListGroup>
          {posts.map(post => {
            const authorName = post.createdBy?.username || 'Unknown';
            const createdAt = new Date(post.createdAt).toLocaleDateString();

            return (
              <ListGroup.Item key={post._id}>
                <h5>
                  <Link to={`/posts/${post._id}`}>
                    {post.title}
                  </Link>
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
        <Alert variant={searchTerm ? 'warning' : 'info'}>
          {searchTerm
            ? `No posts found matching "${searchTerm}". Try another search!`
            : 'No posts yet.'}
        </Alert>
      )}

      {user && (
        <Link to="/posts/new" className="btn btn-success mt-4">
          Create New Post
        </Link>
      )}
    </Container>
);
}
