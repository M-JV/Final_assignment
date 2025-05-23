import React, { useState, useEffect, useContext } from 'react';
import { Container, ListGroup, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout from '../components/layout/Layout';
import { UserContext } from '../context/UserContext';

export default function MyPostsPage() {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get(`/posts/user/${user.id}`);
        setPosts(res.data);
      } catch (err) {
        console.error(err);
        setError('Could not load your posts');
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <Alert variant="warning" className="m-5">
          Please <Link to="/login">log in</Link> to see your posts.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="my-5">
        <h1 className="text-primary text-center mb-4">My Posts</h1>
        {error && <Alert variant="danger">{error}</Alert>}
        {posts.length > 0 ? (
          <ListGroup>
            {posts.map(p => (
              <ListGroup.Item key={p._id}>
                <h5>
                  <Link to={`/posts/${p._id}`}>{p.title}</Link>
                </h5>
                <div className="mt-2">
                  {p.tags?.map(tag => (
                    <Badge bg="secondary" className="mx-1" key={tag}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Alert variant="info">You haven’t created any posts yet.</Alert>
        )}
      </Container>
    </Layout>
  );
}
