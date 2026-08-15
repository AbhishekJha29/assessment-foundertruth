// Clean and normalize API Base URL
const getApiBaseUrl = () => {
  let base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

  // Remove trailing slashes
  base = base.replace(/\/+$/, '');

  // If user entered only domain (e.g. https://my-backend.vercel.app), append /api/v1
  if (!base.endsWith('/api/v1')) {
    base = `${base}/api/v1`;
  }

  return base;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Dispatch custom event for cross-component auth state synchronization
 */
const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ft_auth_changed'));
  }
};

/**
 * Token and user session management via localStorage
 */
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ft_token');
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('ft_token', token);
    } else {
      localStorage.removeItem('ft_token');
    }
    notifyAuthChange();
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('ft_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
};

export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('ft_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ft_user');
    }
    notifyAuthChange();
  }
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ft_token');
    localStorage.removeItem('ft_user');
    notifyAuthChange();
  }
};

/**
 * Generic API Fetch Wrapper
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json().catch(() => ({}));
    } else {
      data = { message: await response.text().catch(() => '') };
    }

    if (!response.ok) {
      // Handle expired or invalid token automatically
      if (response.status === 401 && token) {
        clearAuth();
      }

      const errorMsg =
        data?.message ||
        data?.error ||
        (data?.errors && Array.isArray(data.errors) ? data.errors.map((e) => e.msg || e.message).join(', ') : null) ||
        `Request failed with status code ${response.status}`;

      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    console.error(`[API Connection Error] Failed calling ${url}:`, err);
    throw new Error(
      err.message || `Unable to connect to the backend at ${API_BASE_URL}. Please verify your API URL and CORS settings.`
    );
  }
};

/**
 * Auth API Service
 */
export const authApi = {
  login: async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  },

  register: async (username, email, password) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    if (res.data?.token) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res;
  },

  logout: () => {
    clearAuth();
  }
};

/**
 * Feed API Service
 */
export const feedApi = {
  getFeed: async ({ page = 1, limit = 9, sort = 'newest', source = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (sort) params.append('sort', sort);
    if (source) params.append('source', source);
    if (search) params.append('search', search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch(`/feed${queryString}`);
  },

  getFeedItem: async (id) => {
    return apiFetch(`/feed/${id}`);
  }
};

/**
 * Bookmarks API Service
 */
export const bookmarkApi = {
  getBookmarks: async () => {
    return apiFetch('/bookmarks');
  },

  addBookmark: async (contentId) => {
    return apiFetch(`/feed/${contentId}/bookmark`, {
      method: 'POST'
    });
  },

  removeBookmark: async (contentId) => {
    return apiFetch(`/feed/${contentId}/bookmark`, {
      method: 'DELETE'
    });
  }
};
