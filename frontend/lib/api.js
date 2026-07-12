const api = {
  get: async (url, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { headers, ...config });
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return { data: await response.json() };
  },
  post: async (url, data, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(data),
      ...config 
    });
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return { data: await response.json() };
  },
  put: async (url, data, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { 
      method: 'PUT', 
      headers, 
      body: JSON.stringify(data),
      ...config 
    });
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return { data: await response.json() };
  },
  delete: async (url, config = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(url.startsWith('http') ? url : `/api${url}`, { method: 'DELETE', headers, ...config });
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return { data: await response.json() };
  },
};

export default api;