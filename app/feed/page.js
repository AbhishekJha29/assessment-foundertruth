'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { feedApi, bookmarkApi, getToken } from '../../lib/api';

export default function FeedPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkingId, setBookmarkingId] = useState(null);

  // Check login status & pre-fetch existing bookmarks
  const checkAuthAndBookmarks = useCallback(async () => {
    const token = getToken();
    setIsLoggedIn(!!token);
    if (token) {
      try {
        const res = await bookmarkApi.getBookmarks();
        if (res.success && Array.isArray(res.data)) {
          const ids = new Set(
            res.data.map((b) => b.contentId || b.content?.id).filter(Boolean)
          );
          setBookmarkedIds(ids);
        }
      } catch (e) {
        console.debug('Failed to fetch user bookmarks:', e);
      }
    } else {
      setBookmarkedIds(new Set());
    }
  }, []);

  const fetchFeed = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getFeed({ page: pageNumber, limit: 9 });
      if (response.success) {
        setItems(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load content feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthAndBookmarks();
    const handleAuth = () => checkAuthAndBookmarks();
    window.addEventListener('ft_auth_changed', handleAuth);
    return () => window.removeEventListener('ft_auth_changed', handleAuth);
  }, [checkAuthAndBookmarks]);

  useEffect(() => {
    fetchFeed(page);
  }, [page, fetchFeed]);

  // Gated Article Action: Gated to authenticated users
  const handleReadArticle = (e, contentId) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/feed/${contentId}`);
    } else {
      router.push(`/feed/${contentId}`);
    }
  };

  const handleToggleBookmark = async (e, contentId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=/feed/${contentId}`);
      return;
    }

    if (bookmarkingId === contentId) return;

    setBookmarkingId(contentId);
    const isCurrentlyBookmarked = bookmarkedIds.has(contentId);

    try {
      if (isCurrentlyBookmarked) {
        await bookmarkApi.removeBookmark(contentId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(contentId);
          return next;
        });
      } else {
        await bookmarkApi.addBookmark(contentId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.add(contentId);
          return next;
        });
      }
    } catch (err) {
      alert(err.message || 'Bookmark update failed');
    } finally {
      setBookmarkingId(null);
    }
  };

  const handlePrev = () => {
    if (pagination.hasPrevPage && !loading) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (pagination.hasNextPage && !loading) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">Founder Intelligence Feed</h1>
        <p className="page-subtitle">
          Real-time curated playbooks, tech breakdowns, and founder insights.
        </p>
      </header>

      {/* Loading Skeleton View */}
      {loading && (
        <div className="feed-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
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
          <h2 className="state-title">Unable to Load Feed</h2>
          <p className="state-desc">{error}</p>
          <button
            onClick={() => fetchFeed(page)}
            className="btn btn-outline"
            type="button"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="state-box">
          <div className="state-icon">📄</div>
          <h2 className="state-title">No Feed Items Available</h2>
          <p className="state-desc">
            The content database is currently empty. Run the database seed script to populate articles.
          </p>
        </div>
      )}

      {/* Feed Grid (Publicly browsable) */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="feed-grid">
            {items.map((item) => {
              const isSaved = bookmarkedIds.has(item.id);
              const isProcessing = bookmarkingId === item.id;

              return (
                <article key={item.id} className="feed-card">
                  <div className="feed-card-body">
                    {item.image && (
                      <div
                        onClick={(e) => handleReadArticle(e, item.id)}
                        className="feed-card-image-wrap"
                        style={{ cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleReadArticle(e, item.id);
                          }
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="feed-card-image"
                          onError={(e) => {
                            e.currentTarget.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    <div className="card-meta-row">
                      <span className="badge badge-source">{item.source || 'Intelligence'}</span>
                      <span>
                        {item.publishedAt
                          ? new Date(item.publishedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Recent'}
                      </span>
                    </div>

                    <h2 className="feed-card-title">
                      <a
                        href={`/feed/${item.id}`}
                        onClick={(e) => handleReadArticle(e, item.id)}
                      >
                        {item.title}
                      </a>
                    </h2>

                    <p className="feed-card-desc">
                      {item.description || 'Click to view full analysis and source article.'}
                    </p>
                  </div>

                  <div className="feed-card-footer">
                    <button
                      onClick={(e) => handleReadArticle(e, item.id)}
                      className="btn btn-outline btn-sm"
                      type="button"
                    >
                      Read Article &rarr;
                    </button>

                    {isLoggedIn ? (
                      <button
                        onClick={(e) => handleToggleBookmark(e, item.id)}
                        disabled={isProcessing}
                        className={`bookmark-icon-btn ${isSaved ? 'active' : ''}`}
                        title={isSaved ? 'Remove from bookmarks' : 'Save bookmark'}
                        type="button"
                        aria-label="Bookmark"
                      >
                        {isProcessing ? '⏳' : isSaved ? '★' : '☆'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleToggleBookmark(e, item.id)}
                        className="bookmark-icon-btn"
                        title="Log in to bookmark"
                        type="button"
                        aria-label="Bookmark"
                      >
                        ☆
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-bar">
              <div className="pagination-info">
                Page <strong>{pagination.currentPage}</strong> of{' '}
                <strong>{pagination.totalPages}</strong> &bull; {pagination.totalItems} total items
              </div>

              <div className="pagination-actions">
                <button
                  onClick={handlePrev}
                  disabled={!pagination.hasPrevPage || loading}
                  className="btn btn-outline"
                  type="button"
                >
                  &larr; Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!pagination.hasNextPage || loading}
                  className="btn btn-outline"
                  type="button"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
