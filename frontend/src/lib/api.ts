import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Profile API
export const profileAPI = {
  getMe: () => api.get('/profile/me'),
  getOnboardingQuestions: () => api.get('/profile/onboarding/questions'),
  submitOnboarding: (answers: Record<string, string>) =>
    api.post('/profile/onboarding', { answers }),
  update: (data: Partial<{
    experience_level: string;
    preferred_style: string;
    goal: string;
    background: string;
    known_concepts: string[];
  }>) => api.patch('/profile/me', data),
};

// Problems API
export const problemsAPI = {
  list: (params?: { difficulty?: number; concept_id?: string }) =>
    api.get('/problems/list', { params }),
  getById: (id: string) => api.get(`/problems/${id}`),
};

// Review API
export const reviewAPI = {
  submit: (data: { problem_id: string; code: string; language: string }) =>
    api.post('/review/submit', data),
  history: (limit = 10) => api.get('/review/history', { params: { limit } }),
};

// Tutor API
export const tutorAPI = {
  ask: (data: { problem_id: string; question: string }) =>
    api.post('/tutor/ask', data),
  hint: (problem_id: string) => api.post('/tutor/hint', { problem_id }),
};

// Graph API
export const graphAPI = {
  getConcepts: () => api.get('/graph/concepts'),
  getStudentGraph: () => api.get('/graph/student'),
  getRecommendations: () => api.get('/graph/recommend'),
  getPath: (from: string, to: string) =>
    api.get('/graph/path', { params: { from_concept: from, to_concept: to } }),
};

// Insights API
export const insightsAPI = {
  getMe: () => api.get('/insights/me'),
};
