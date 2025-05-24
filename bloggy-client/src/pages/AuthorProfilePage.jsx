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

  // — make sure we're comparing the same ID that Passport gave us —
  // depending on your UserContext you may have stored it as `user._id` or `user.id`
  const myId    = user?._id ?? user?.id;
  const isOwner = myId === id;

  // 1) load the author and their posts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/${id}`),           // { _id, username }
      api.get(`/posts?author=${id}`)     // [ ...posts ]
    ])
      .then(([uRes, pRes]) => {
        setAuthor(uRes.data);
        setPosts(pRes.data);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Error loading profile');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 2) if it's not your own page, check subscription status
  useEffect(() => {
    if (myId && !isOwner) {
      api.get(`/users/${id}/isSubscribed`)
        .then(res => setSubscribed(!!res.data.isSubscribed))
        .catch(err => console.error('Error fetching subscription status', err));
    }
  }, [myId, isOwner, id]);

  // 3) toggle subscribe/unsubscribe
  const toggleSubscription = async () => {
    if (!user) return navigate('/login');
    setToggling(true);
    try {
      const action = subscribed ? 'unfollow' : 'follow';
      await api.post(`/users/${id}/${action}`);
      console.log(subscribed ? 'Successfully unsubscribed' : 'Successfully subscribed');
      setSubscribed(s => !s);
    } catch (err) {
      // silence the “can't follow yourself” 400
      if (
        err.response?.status === 400 &&
        err.response.data?.message?.includes("Can't follow")
      ) {
        console.warn('Tried to follow yourself – ignoring.');
      } else {
        console.error('Subscription error', err);
        setError('Could not update subscription');
      }
    } finally {
      setToggling(false);
    }
  };

  // 4) delete a post (only on your own page)
  const deletePost = async postId => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(ps => ps.filter(p => p._id !== postId));
    } catch (err) {
      console.error(err);
      alert('Could not delete post');
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!author) {
    return (
      <Container className="my-5">
        <Alert>No such user.</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5" style={{ maxWidth: 800 }}>
      <h2>
        {author.username}{' '}
        <small className="text-muted">({posts.length} posts)</small>
      </h2>

      {/* Subscribe / Unsubscribe */}
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
              : 'Subscribe'}
        </Button>
      )}

      {/* No posts */}
      {posts.length === 0 && (
        <Alert variant="info">This author has no posts yet.</Alert>
      )}

      {/* Post list */}
      {posts.map(post => (
        <Card key={post._id} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title>
              <Link to={`/posts/${post._id}`}>{post.title}</Link>
            </Card.Title>
            <small className="text-muted">
              {new Date(post.createdAt).toLocaleDateString()}
            </small>
            <p className="mt-2">{post.content.slice(0, 100)}…</p>
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
