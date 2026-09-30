import re

with open('d:/care connect/frontend/src/api/client.ts', 'r') as f:
    content = f.read()

fetch_wrapper = '''export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';

const getAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = localStorage.getItem('token');
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
};

const fetchApi = async (url: string, options: RequestInit = {}) => {
  options.headers = getAuthHeaders(options.headers as Record<string, string>);
  const response = await fetch(url, options);
  if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
  }
  return response;
};
'''

content = content.replace("export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api';", fetch_wrapper)
content = content.replace('await fetch(', 'await fetchApi(')

with open('d:/care connect/frontend/src/api/client.ts', 'w') as f:
    f.write(content)
