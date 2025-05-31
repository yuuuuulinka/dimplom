import axios from 'axios';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  preferences?: {
    emailNotifications: boolean;
    darkMode: boolean;
    saveProgress: boolean;
  };
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: string;
  }>;
}

export interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  message: string;
  token: string;
  user: User;
}

export interface SavedGraph {
  id: string;
  name: string;
  graph: {
    type: string;
    nodes: Array<{
      id: number;
      label: string;
      x: number;
      y: number;
    }>;
    edges: Array<{
      id: number;
      source: number;
      target: number;
      weight?: number;
    }>;
  };
  dateCreated: string;
  dateModified: string;
}

interface GetGraphsResponse {
  message: string;
  graphs: SavedGraph[];
}

interface SaveGraphResponse {
  message: string;
  graphId: number;
}

interface DeleteGraphResponse {
  message: string;
}

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`Making API request to: ${config.baseURL}${config.url}`);
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API response received:`, response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check if backend server is running on port 3000');
    }
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: async (name: string, surname: string, email: string, password: string): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>('/auth/register', { name, surname, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    return data;
  },

  loginWithGoogle: () => {
    window.location.href = `${API_URL}/auth/google`;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post(`/auth/verify/${token}`);
    return response.data;
  }
};

export const users = {
  updateProfile: async (data: {
    name: string;
    surname: string;
    email: string;
    currentPassword?: string;
    newPassword?: string;
    preferences?: {
      emailNotifications: boolean;
      darkMode: boolean;
      saveProgress: boolean;
    };
  }) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  requestDeletion: async () => {
    const response = await api.post('/users/delete-request');
    return response.data;
  },

  confirmDeletion: async (token: string) => {
    const response = await api.delete(`/users/confirm-deletion/${token}`);
    return response.data;
  }
};

export const graphs = {
  getUserGraphs: async (): Promise<GetGraphsResponse> => {
    const response = await api.get<GetGraphsResponse>('/api/graphs/user');
    return response.data;
  },

  saveGraph: async (graphName: string, graph: any): Promise<SaveGraphResponse> => {
    const response = await api.post<SaveGraphResponse>('/api/graphs/save', {
      graphName,
      graph
    });
    return response.data;
  },

  deleteGraph: async (graphId: string): Promise<DeleteGraphResponse> => {
    const response = await api.delete<DeleteGraphResponse>(`/api/graphs/${graphId}`);
    return response.data;
  }
};

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string | null;
}

interface GetAchievementsResponse {
  message: string;
  achievements: Achievement[];
}

interface UpdateAchievementResponse {
  message: string;
}

export const achievements = {
  getUserAchievements: async (): Promise<GetAchievementsResponse> => {
    const response = await api.get<GetAchievementsResponse>('/api/achievements');
    return response.data;
  },

  updateAchievement: async (achievementId: string, earned: boolean): Promise<UpdateAchievementResponse> => {
    const response = await api.put<UpdateAchievementResponse>(`/api/achievements/${achievementId}`, {
      earned
    });
    return response.data;
  }
};

export default {
  auth,
  users,
  graphs,
  achievements
}; 