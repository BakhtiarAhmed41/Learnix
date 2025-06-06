import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  full_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post('/api/v1/auth/login', {
            username: email,
            password,
          });

          const { access_token } = response.data;
          
          // Get user profile
          const userResponse = await axios.get('/api/v1/users/me', {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          });

          set({
            user: userResponse.data,
            token: access_token,
            isAuthenticated: true,
          });

          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      register: async (email: string, password: string, full_name: string) => {
        try {
          await axios.post('/api/v1/auth/register', {
            email,
            password,
            full_name,
          });

          // After successful registration, log in the user
          await useAuthStore.getState().login(email, password);
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        delete axios.defaults.headers.common['Authorization'];
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export { useAuthStore }; 