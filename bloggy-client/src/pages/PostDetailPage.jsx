// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Button, Badge } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from '../components/layout/Layout';
import { UserContext } from '../context/UserContext';

export default function PostDetailPage() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${id}`);
        navigate('/posts');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!post) return <Layout><p>Loading...</p></Layout>;

  return (
    <Layout>
      <Container className="post-container my-5">
        <h1 className="text-primary">{post.title}</h1>
        <p>{post.content}</p>
        <small className="text-muted">
          Created by {post.createdBy.username} on{' '}
          {new Date(post.createdAt).toDateString()}
        </small>

        {post.tags?.length > 0 && (
          <>
            <h6 className="mt-4">Tags:</h6>
            {post.tags.map(tag => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
              >
                <Badge bg="info text-dark" className="me-1">
                  {tag}
                </Badge>
              </Link>
            ))}
          </>
        )}

        {user && user.id === post.createdBy._id && (
          <div className="mt-4 button-group">
            <Link to={`/posts/${id}/edit`} className="btn btn-primary me-2">
              Edit
            </Link>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        )}
      </Container>
    </Layout>
  );
}

