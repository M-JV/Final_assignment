// src/components/posts/PostsList.jsx
import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function PostsList({ posts }) {
  if (!posts || posts.length === 0) {
    return <p className="text-center">No posts to display.</p>;
  }

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {posts.map(post => (
        <Col key={post._id}>
          <Card className="h-100 shadow">
            <Card.Body>
              <Card.Title>
                <Link to={`/posts/${post._id}`}>{post.title}</Link>
              </Card.Title>
              <div className="mb-2">
                {post.tags.map(tag => (
                  <Badge bg="secondary" className="me-1" key={tag}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <Card.Text>
                {post.content.slice(0, 100)}…
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent">
              <small className="text-muted">
                By <Link to={`/users/${post.createdBy._id}`}>
                  {post.createdBy.username}
                </Link>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
