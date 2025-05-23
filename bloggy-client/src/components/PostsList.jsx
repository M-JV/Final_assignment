// src/components/PostsList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import { Card } from 'react-bootstrap';

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get('/posts')
       .then(r => setPosts(r.data))
       .catch(console.error);
  }, []);
  return (
    <div className="container mt-4">
      <h2>All Posts</h2>
      {posts.map(p => (
        <Card key={p._id} className="mb-3">
          <Card.Body>
            <Card.Title>{p.title}</Card.Title>
            <Card.Text>{p.content}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
