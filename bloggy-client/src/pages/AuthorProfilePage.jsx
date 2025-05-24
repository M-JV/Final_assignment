// src/pages/AuthorProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function AuthorProfilePage() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [author,     setAuthor]     = useState(null);
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [toggling,   setToggling]   = useState(false);

  const isOwner = user?.id === id;

  // 1) Load author info + their posts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/posts?author=${id}`)
    ])
      .then(([userRes, postsRes]) => {
        setAuthor(userRes.data);
        setPosts(postsRes.data);
      })
      .catch(() => {
        setError('Error loading profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // 2) If not viewing your own page, check subscription status
  useEffect(() => {
    if (user && !isOwner) {
      api.get(`/users/${id}/isSubscribed`, { withCredentials: true })
        .then(res => {
          setSubscribed(res.data.isSubscribed);
        })
        .catch(() => {
          /* silently ignore */
        });
    }
  }, [user, isOwner, id]);

  // 3) Toggle subscribe/unsubscribe
  const toggleSubscription = async () => {
    if (!user) return navigate('/login');
    setToggling(true);
    try {
      const url = subscribed
        ? `/users/${id}/unfollow`
        : `/users/${id}/follow`;
      await api.post(url);
      setSubscribed(!subscribed);
    } catch {
      /* silently ignore */
    } finally {
      setToggling(false);
    }
  };

  // 4) Delete a post (only on your own page)
  const deletePost = async postId => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(ps => ps.filter(p => p._id !== postId));
    } catch {
      alert('Could not delete post');
    }
  };

  if (loading) return <Container className="my-5 text-center"><Spinner /></Container>;
  if (error)   return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!author) return <Container className="my-5"><Alert>No such user.</Alert></Container>;

  return (
    <Container className="my-5" style={{ maxWidth: 800 }}>
      <h2>
        {author.username}
        {' '}
        <small className="text-muted">({posts.length} posts)</small>
      </h2>

      {/* subscribe button */}
      {!isOwner && user && (
        <Button
          size="sm"
          variant={subscribed ? 'outline-danger' : 'outline-success'}
          onClick={toggleSubscription}
          disabled={toggling}
          className="mb-4"
        >
          {toggling
            ? '…'
            : subscribed
              ? 'Unsubscribe'
              : 'Subscribe'
          }
        </Button>
      )}

      {/* no posts */}
      {posts.length === 0 && (
        <Alert variant="info">This author has no posts yet.</Alert>
      )}

      {/* posts list */}
      {posts.map(post => (
        <Card key={post._id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>
              <Link to={`/posts/${post._id}`}>{post.title}</Link>
            </Card.Title>
            <small className="text-muted">
              {new Date(post.createdAt).toLocaleDateString()}
            </small>
            <p className="mt-2">
              {post.content.slice(0, 100)}…
            </p>
            {isOwner && (
              <div>
                <Link
                  to={`/posts/${post._id}/edit`}
                  className="btn btn-sm btn-outline-primary me-2"
                >
                  Edit
                </Link>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => deletePost(post._id)}
                >
                  Delete
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}
