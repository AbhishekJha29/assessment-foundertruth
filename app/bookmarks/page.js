'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { bookmarkApi, getToken } from '../../lib/api';

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookmarkApi.getBookmarks();
      if (res.success) {
        setBookmarks(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch saved bookmarks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBookmarks();
  }, [router, fetchBookmarks]);

  const handleRemove = async (contentId) => {
    setRemovingId(contentId);
    try {
      await bookmarkApi.removeBookmark(contentId);
      // Remove locally from state for immediate responsive feedback
      setBookmarks((prev) =>
        prev.filter((b) => b.contentId !== contentId && b.content?.id !== contentId)
      );
    } catch (err) {
      alert(err.message || 'Failed to remove bookmark.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Saved Bookmarks</h1>
        <p className="page-subtitle">
          Your curated library of essential founder articles, playbooks, and insights.
        </p>
      </header>

      {/* Loading Skeletons */}
      {loading && (
        <div className="feed-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton skeleton-img"></div>
              <div className="skeleton skeleton-line short"></div>
              <div className="skeleton skeleton-line" style={{ height: '22px' }}></div>
              <div className="skeleton skeleton-line medium"></div>
              <div className="skeleton skeleton-line"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h2 className="state-title">Unable to Load Bookmarks</h2>
          <p className="state-desc">{error}</p>
          <button
            onClick={fetchBookmarks}
            className="btn btn-outline"
            type="button"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bookmarks.length === 0 && (
        <div className="state-box">
          <div className="state-icon">🔖</div>
          <h2 className="state-title">No Saved Bookmarks Yet</h2>
          <p className="state-desc">
            You haven&apos;t saved any articles yet. Explore the founder intelligence feed and click the bookmark button on any story to save it here.
          </p>
          <Link href="/feed" className="btn btn-primary">
            Explore Feed &rarr;
          </Link>
        </div>
      )}

      {/* Bookmarks Grid */}
      {!loading && !error && bookmarks.length > 0 && (
        <div className="feed-grid">
          {bookmarks.map((bm) => {
            const content = bm.content || {};
            const contentId = bm.contentId || content.id;
            const isRemoving = removingId === contentId;

            return (
              <article key={bm.id || bm._id || contentId} className="feed-card">
                <div className="feed-card-body">
                  {content.image && (
                    <Link href={`/feed/${contentId}`} className="feed-card-image-wrap" tabIndex={-1}>
                      <img
                        src={content.image}
                        alt={content.title || 'Bookmark'}
                        className="feed-card-image"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = 'none';
                        }}
                      />
                    </Link>
                  )}

                  <div className="card-meta-row">
                    <span className="badge badge-source">{content.source || 'Saved'}</span>
                    <span>
                      {bm.createdAt
                        ? `Saved ${new Date(bm.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}`
                        : 'Saved recently'}
                    </span>
                  </div>

                  <h2 className="feed-card-title">
                    <Link href={`/feed/${contentId}`}>{content.title || 'Untitled Article'}</Link>
                  </h2>

                  <p className="feed-card-desc">
                    {content.description || 'No description provided.'}
                  </p>
                </div>

                <div className="feed-card-footer">
                  <Link href={`/feed/${contentId}`} className="btn btn-outline btn-sm">
                    Read Article &rarr;
                  </Link>

                  <button
                    onClick={() => handleRemove(contentId)}
                    disabled={isRemoving}
                    className="btn btn-danger btn-sm"
                    type="button"
                  >
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
