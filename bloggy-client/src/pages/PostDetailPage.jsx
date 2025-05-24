import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { UserContext } from '../context/UserContext';

export default function PostDetailPage() {
  const { id }   = useParams();
  const { user } = useContext(UserContext);
  const nav      = useNavigate();

  const [post,      setPost]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [toggling,  setToggling]  = useState(false);

  // load post
  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(r => setPost(r.data))
      .catch(e => setError(e.response?.data?.message || 'Error'))
      .finally(() => setLoading(false));
  }, [id]);

  // check subscribe (once we have both post & user)
  useEffect(() => {
    if (user && post?.createdBy?._id && user.id !== post.createdBy._id) {
      api.get(`/users/${post.createdBy._id}/isSubscribed`, { withCredentials: true })
         .then(r => setSubscribed(r.data.isSubscribed))
         .catch(console.error);
    }
  }, [user, post]);

  const toggle = async () => {
    if (!user) return nav('/login');
    setToggling(true);
    try {
      const url = subscribed
        ? `/users/${post.createdBy._id}/unfollow`
        : `/users/${post.createdBy._id}/follow`;
      await api.post(url);
      setSubscribed(!subscribed);
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/posts/${id}`);
      nav('/posts');
    } catch (e) {
      setError(e.response?.data?.message || 'Error deleting');
    }
  };

  if (loading) return <Container className="text-center my-5"><Spinner /></Container>;
  if (error)   return <Container className="my-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!post)   return <Container className="my-5"><Alert>No post.</Alert></Container>;

  const { title, content, tags, createdBy, createdAt } = post;
  const isOwner = user?.id === createdBy._id;
  const dateStr = new Date(createdAt).toLocaleDateString();

  return (
    <Container className="my-5">
      <Card className="mx-auto" style={{ maxWidth: 800 }}>
        <Card.Body>
          <h1 className="mb-3 text-primary">{title}</h1>
          <div className="mb-3">
            By <Link to={`/author/${createdBy._id}`}>{createdBy.username}</Link> on {dateStr}
            {!isOwner && user && (
              <Button
                size="sm"
                variant={subscribed ? 'outline-danger' : 'outline-success'}
                className="ms-3"
                disabled={toggling}
                onClick={toggle}
              >
                {toggling ? '…' : subscribed ? 'Unsubscribe' : 'Subscribe'}
              </Button>
            )}
          </div>
          <Card.Text>{content}</Card.Text>
          <div className="mb-4">
            {tags?.map(t => (
              <Link key={t} to={`/posts?q=${encodeURIComponent(t)}`} className="me-2">
                <Badge bg="info">{t}</Badge>
              </Link>
            ))}
          </div>
          {isOwner && (
            <div>
              <Link to={`/posts/${id}/edit`} className="btn btn-primary me-2">Edit</Link>
              <Button variant="danger" onClick={remove}>Delete</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
