export const QUIZ_TYPES = {
  MCQ: 'mcq',
  SAQ: 'saq',
  LAQ: 'laq',
}

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
}

export const DOCUMENT_TYPES = {
  NCERT: 'ncert',
  UPLOADED: 'uploaded',
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
  },
  DOCUMENTS: {
    BASE: '/documents/',
    SEARCH: '/documents/search/',
    REPROCESS: '/documents/{id}/reprocess/',
  },
  QUIZZES: {
    BASE: '/quizzes/quizzes/',
    GENERATE: '/quizzes/quizzes/generate/',
    ATTEMPTS: '/quizzes/attempts/',
    STATS: '/quizzes/attempts/stats/',
  },
  PROGRESS: {
    BASE: '/progress/progress/',
    STATS: '/progress/progress/stats/',
    OVERVIEW: '/progress/progress/overview/',
    SESSIONS: '/progress/sessions/',
    GOALS: '/progress/goals/',
  },
}

export const STORAGE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'access_token',
  IS_AUTHENTICATED: 'isAuthenticated',
}

export const PDF_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: '.pdf',
}