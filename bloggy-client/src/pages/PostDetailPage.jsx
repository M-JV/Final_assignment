import React, { useState, useEffect, useContext } from 'react'
import {
  Container,
  Card,
  Button,
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { UserContext } from '../context/UserContext'

export default function PostDetailPage() {
  const { id }   = useParams()
  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  const [post, setPost]               = useState(null)
  const [loadingPost, setLoadingPost] = useState(true)
  const [error, setError]             = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [toggling, setToggling]       = useState(false)

  // 1️⃣ Load the post
  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => setError(err.response?.data?.message || 'Error loading post'))
      .finally(() => setLoadingPost(false))
  }, [id])

  // 2️⃣ Check subscribe status once post + user are known
  useEffect(() => {
    if (user && post?.createdBy?._id) {
      api.get(`/users/${post.createdBy._id}/isSubscribed`, { withCredentials: true })
        .then(res => setIsSubscribed(res.data.isSubscribed))
        .catch(console.error)
    }
  }, [user, post])

  const handleToggleSubscribe = async () => {
    if (!user) return
    setToggling(true)
    try {
      if (isSubscribed) {
        await api.post(`/users/${post.createdBy._id}/unfollow`)
      } else {
        await api.post(`/users/${post.createdBy._id}/follow`)
      }
      setIsSubscribed(!isSubscribed)
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await api.delete(`/posts/${id}`)
      navigate('/posts')
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting post')
    }
  }

  if (loadingPost) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
      </Container>
    )
  }
  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    )
  }
  if (!post) {
    return (
      <Container className="my-5">
        <Alert>No post found.</Alert>
      </Container>
    )
  }

  const { title, content, tags, createdBy, createdAt } = post
  const isAuthor = user?.id === createdBy._id
  const when     = new Date(createdAt).toLocaleDateString()

  return (
    <Container className="my-5">
      <Card className="mx-auto shadow" style={{ maxWidth: 800 }}>
        <Card.Body>
          <h1 className="text-primary mb-3">{title}</h1>

          <div className="mb-3 text-muted d-flex align-items-center">
            By{' '}
            <Link to={`/author/${createdBy._id}`} className="fw-bold mx-2">
              {createdBy.username}
            </Link>
            on {when}

            {!isAuthor && user && (
              <Button
                size="sm"
                variant={isSubscribed ? 'outline-danger' : 'outline-success'}
                className="ms-3"
                onClick={handleToggleSubscribe}
                disabled={toggling}
              >
                {toggling
                  ? '...'
                  : isSubscribed
                    ? 'Unsubscribe'
                    : 'Subscribe'
                }
              </Button>
            )}
          </div>

          <Card.Text className="mb-4">{content}</Card.Text>

          {tags?.map(tag => (
            <Link
              key={tag}
              to={`/posts?q=${encodeURIComponent(tag)}`}
              className="me-2"
            >
              <Badge bg="info">{tag}</Badge>
            </Link>
          ))}

          {isAuthor && (
            <div className="mt-4">
              <Link to={`/posts/${id}/edit`} className="btn btn-primary me-2">
                Edit
              </Link>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}
