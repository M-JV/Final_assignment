// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import Layout              from './components/layout/Layout.jsx';
import HomePage            from './pages/HomePage.jsx';
import PostsPage           from './pages/PostsPage.jsx';
import MyPostsPage         from './pages/MyPostsPage.jsx';
import NewPostPage         from './pages/NewPostPage.jsx';
import PostDetailPage      from './pages/PostDetailPage.jsx';
import EditPostPage        from './pages/EditPostPage.jsx';
import SearchPage          from './pages/SearchPage.jsx';
import LoginPage           from './pages/LoginPage.jsx';
import RegisterPage        from './pages/RegisterPage.jsx';
import AdminPostsPage      from './pages/AdminPostsPage.jsx';
import AdminUsersPage      from './pages/AdminUsersPage.jsx';
import AuthorProfilePage   from './pages/AuthorProfilePage.jsx';
import SubscriptionsPage   from './pages/SubscriptionsPage.jsx';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* wrap every page in the same Layout */}
          <Route element={<Layout />}>
            <Route path="/"                   element={<HomePage />} />
            <Route path="posts"               element={<PostsPage />} />
            <Route path="my-posts"            element={<MyPostsPage />} />
            <Route path="posts/new"           element={<NewPostPage />} />
            <Route path="posts/:id"           element={<PostDetailPage />} />
            <Route path="posts/:id/edit"      element={<EditPostPage />} />
            <Route path="search"              element={<SearchPage />} />
            <Route path="author/:id"          element={<AuthorProfilePage />} />
            <Route path="subscriptions"       element={<SubscriptionsPage />} />
            <Route path="login"               element={<LoginPage />} />
            <Route path="register"            element={<RegisterPage />} />
            <Route path="admin/posts"         element={<AdminPostsPage />} />
            <Route path="admin/users"         element={<AdminUsersPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
