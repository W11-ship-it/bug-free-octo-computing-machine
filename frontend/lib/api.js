import axios from 'axios';

const api = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api' : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  timeout: 10000,
  maxRedirects: 0,
});

const cache = new Map();

function getCacheKey(config) {
  return `${config.method || 'get'}:${config.url}:${JSON.stringify(config.params)}`;
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  if (config.url === '/plans' && config.method === 'get') {
    config.url = '/plans/';
  }
  
  if (config.cache !== false) {
    const cacheKey = getCacheKey(config);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return Promise.resolve({ data: cached.data, config });
    }
  }
  
  return config;
});

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

api.interceptors.response.use(
  (response) => {
    const config = response.config;
    if (config.cache !== false) {
      const cacheKey = getCacheKey(config);
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error);
    }
    
    return Promise.reject(error);
  },
);

export function clearCache() {
  cache.clear();
}

export function invalidateCache(url) {
  cache.forEach((_, key) => {
    if (key.includes(url)) {
      cache.delete(key);
    }
  });
}

export default api;