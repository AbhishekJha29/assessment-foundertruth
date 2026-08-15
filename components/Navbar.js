'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken, getUser, clearAuth } from '../lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const syncAuthState = () => {
    const token = getToken();
    const currentUser = getUser();
    if (token) {
      setUser(currentUser || { username: 'Member' });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncAuthState();

    // Listen for custom auth events across components
    const handleAuthEvent = () => syncAuthState();
    window.addEventListener('ft_auth_changed', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    return () => {
      window.removeEventListener('ft_auth_changed', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link href="/feed" className="nav-brand">
          <span className="brand-icon">FT</span>
          <span>FounderTruth</span>
        </Link>

        <nav className="nav-links">
          <Link
            href="/feed"
            className={`nav-link ${pathname === '/' || pathname.startsWith('/feed') ? 'active' : ''}`}
          >
            Feed
          </Link>

          {mounted && user ? (
            <>
              <Link
                href="/bookmarks"
                className={`nav-link ${pathname === '/bookmarks' ? 'active' : ''}`}
              >
                Bookmarks
              </Link>
              <div className="user-badge" title={user.email || user.username}>
                <span className="user-avatar-dot"></span>
                <span>{user.username || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            mounted && (
              <>
                <Link
                  href="/login"
                  className={`nav-link ${pathname === '/login' ? 'active' : ''}`}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
