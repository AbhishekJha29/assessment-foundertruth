'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { feedApi, bookmarkApi, getToken } from '../../../lib/api';

export default function ContentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params?.id;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = useCallback(async () => {
    if (!contentId) return;
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/feed/${contentId}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const itemRes = await feedApi.getFeedItem(contentId);
      if (itemRes.success) {
        setItem(itemRes.data);
      }

      try {
        const bookmarksRes = await bookmarkApi.getBookmarks();
        if (bookmarksRes.success && Array.isArray(bookmarksRes.data)) {
          const exists = bookmarksRes.data.some(
            (b) => b.contentId === contentId || b.content?.id === contentId
          );
          setIsBookmarked(exists);
        }
      } catch (bmErr) {
        console.debug('Could not load bookmark status:', bmErr);
      }
    } catch (err) {
      setError(err.message || 'Failed to load article details.');
    } finally {
      setLoading(false);
    }
  }, [contentId, router]);

  useEffect(() => {
    loadData();
    const handleAuth = () => loadData();
    window.addEventListener('ft_auth_changed', handleAuth);
    return () => window.removeEventListener('ft_auth_changed', handleAuth);
  }, [loadData]);

  const handleToggleBookmark = async () => {
    if (actionLoading) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      if (isBookmarked) {
        await bookmarkApi.removeBookmark(contentId);
        setIsBookmarked(false);
        setFeedback({ type: 'success', message: 'Bookmark removed successfully.' });
      } else {
        await bookmarkApi.addBookmark(contentId);
        setIsBookmarked(true);
        setFeedback({ type: 'success', message: 'Article saved to your bookmarks!' });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Bookmark update failed. Please try again.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/feed" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
          &larr; Back to Intelligence Feed
        </Link>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="article-detail">
          <div className="skeleton" style={{ height: '240px', marginBottom: '20px' }}></div>
          <div className="skeleton skeleton-line short" style={{ marginBottom: '14px' }}></div>
          <div className="skeleton skeleton-line" style={{ height: '32px', marginBottom: '20px' }}></div>
          <div className="skeleton skeleton-line" style={{ marginBottom: '10px' }}></div>
          <div className="skeleton skeleton-line medium" style={{ marginBottom: '10px' }}></div>
          <div className="skeleton skeleton-line"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Article Not Found</h2>
          <p className="state-desc">{error}</p>
          <Link href="/feed" className="btn btn-primary">
            Return to Feed
          </Link>
        </div>
      )}

      {/* Detail Card */}
      {!loading && !error && item && (
        <article className="article-detail">
          {feedback && (
            <div
              className={`alert ${
                feedback.type === 'error' ? 'alert-error' : 'alert-success'
              }`}
            >
              <span>{feedback.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{feedback.message}</span>
            </div>
          )}

          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="article-image-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <div className="card-meta-row" style={{ marginBottom: '16px' }}>
            <span className="badge">{item.source || 'Intelligence'}</span>
            <span>
              Published{' '}
              {item.publishedAt
                ? new Date(item.publishedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Recently'}
            </span>
          </div>

          <h1 className="article-title-lg">{item.title}</h1>

          <div className="article-body">
            {item.description || 'No extended summary is available for this article.'}
          </div>

          {item.url && (
            <div style={{ marginBottom: '28px' }}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                ↗ Read Full Story on {item.source || 'Original Source'}
              </a>
            </div>
          )}

          <div className="article-actions-bar">
            <button
              onClick={handleToggleBookmark}
              disabled={actionLoading}
              className={`btn ${isBookmarked ? 'btn-danger' : 'btn-primary'}`}
              type="button"
            >
              {actionLoading
                ? 'Updating...'
                : isBookmarked
                ? '★ Remove from Bookmarks'
                : '☆ Save to Bookmarks'}
            </button>

            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ID: {item.id}
            </span>
          </div>
        </article>
      )}
    </div>
  );
}
