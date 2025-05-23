// src/components/layout/Layout.jsx
import React from 'react';
import { Outlet }    from 'react-router-dom';
import { Container } from 'react-bootstrap';
import AppNavbar     from './Navbar.jsx';

export default function Layout() {
  return (
    <>
      <AppNavbar />

      {/* Main content area */}
      <Container fluid className="mt-4 mb-5">
        <Outlet />
      </Container>

      {/* Footer */}
      <footer className="footer mt-auto py-3 custom-footer">
        <Container className="text-center">
          <p className="text-muted mb-0">
            &copy; 2025 Bloggy 🌟 | Built with ❤️ and ☕
          </p>
        </Container>
      </footer>
    </>
  );
}
