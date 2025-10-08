import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session-based auth
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/me/'),
};

// Documents API
export const documentAPI = {
  getAll: () => api.get('/documents/'),
  get: (id) => api.get(`/documents/${id}/`),
  upload: (formData) => api.post('/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/documents/${id}/`),
  search: (query, documentId = null) => 
    api.post('/documents/search/', { query, document_id: documentId }),
  reprocess: (id) => api.post(`/documents/${id}/reprocess/`),
};

// Quizzes API
export const quizAPI = {
  getAll: () => api.get('/quizzes/quizzes/'),
  get: (id) => api.get(`/quizzes/quizzes/${id}/`),
  generate: (data) => api.post('/quizzes/quizzes/generate/', data),
  createAttempt: (quizId) => api.post('/quizzes/attempts/', { quiz_id: quizId }),
  submitAttempt: (attemptId, data) => 
    api.post(`/quizzes/attempts/${attemptId}/submit/`, data),
  getAttempts: () => api.get('/quizzes/attempts/'),
  getAttempt: (id) => api.get(`/quizzes/attempts/${id}/`),
  getStats: () => api.get('/quizzes/attempts/stats/'),
};

// Progress API
export const progressAPI = {
  getProgress: () => api.get('/progress/progress/'),
  getProgressStats: () => api.get('/progress/progress/stats/'),
  getProgressOverview: () => api.get('/progress/progress/overview/'),
  getStudySessions: () => api.get('/progress/sessions/'),
  getRecentSessions: () => api.get('/progress/sessions/recent/'),
  startStudySession: (data) => api.post('/progress/sessions/start/', data),
  endStudySession: (sessionId) => api.post(`/progress/sessions/${sessionId}/end/`),
  getLearningGoals: () => api.get('/progress/goals/'),
  createLearningGoal: (data) => api.post('/progress/goals/', data),
  updateLearningGoal: (id, data) => api.patch(`/progress/goals/${id}/`, data),
  updateGoalProgress: (id, progress) => 
    api.post(`/progress/goals/${id}/update_progress/`, { progress }),
};

export default api;