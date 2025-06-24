import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Removed manual CORS headers
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) throw new Error('No refresh token');
      
      const response = await api.post('/auth/refresh/', { refresh });
      const { access } = response.data;
      localStorage.setItem('token', access);
      return response.data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
};

// Document API
export const documentAPI = {
  list: async () => {
    try {
      const response = await api.get('/documents/');
      return response.data;
    } catch (error) {
      console.error('List documents error:', error);
      throw error;
    }
  },

  upload: async (file: File, title: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      
      const response = await api.post('/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/documents/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Get document error:', error);
      throw error;
    }
  },

  delete: async (id: number) => {
    try {
      await api.delete(`/documents/${id}/`);
    } catch (error) {
      console.error('Delete document error:', error);
      throw error;
    }
  },

  generateTest: async (id: number, examType: string, questionCount: number, difficulty: string, timeLimit: number) => {
    try {
      const response = await api.post(`/documents/${id}/generate_test/`, {
        exam_type: examType,
        question_count: questionCount,
        difficulty,
        time_limit: timeLimit,
      });
      return response.data;
    } catch (error) {
      console.error('Generate test error:', error);
      throw error;
    }
  },
};

// Test API
export const testAPI = {
  list: async () => {
    try {
      const response = await api.get('/tests/');
      return response.data;
    } catch (error) {
      console.error('List tests error:', error);
      throw error;
    }
  },

  get: async (id: number) => {
    try {
      const response = await api.get(`/tests/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Get test error:', error);
      throw error;
    }
  },

  getAttempt: async (attemptId: number) => {
    try {
      const response = await api.get(`/test-attempts/${attemptId}/`);
      return response.data;
    } catch (error) {
      console.error('Get test attempt error:', error);
      throw error;
    }
  },

  createAttempt: async (testId: number) => {
    try {
      const response = await api.post('/test-attempts/', { test: testId });
      return response.data;
    } catch (error) {
      console.error('Create test attempt error:', error);
      throw error;
    }
  },

  submit: async (attemptId: number, answers: { questionId: number; answer: string }[]) => {
    try {
      const response = await api.post(`/test-attempts/${attemptId}/submit/`, { answers });
      return response.data;
    } catch (error) {
      console.error('Submit test error:', error);
      throw error;
    }
  },
};

export default api; 