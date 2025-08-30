import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import { setUser, setLoading, signOut as signOutAction, updateProfile as updateProfileAction, type User } from '@/store/slices/authSlice';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: { display_name?: string; avatar_url?: string }) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ error: any; url?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage key
const MOCK_USER_KEY = 'ragforge_mock_user';
const MOCK_USERS_KEY = 'ragforge_mock_users';

// Helper functions for mock user management
const getMockUsers = (): Record<string, { password: string; user: User }> => {
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveMockUsers = (users: Record<string, { password: string; user: User }>) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

const getCurrentMockUser = (): User | null => {
  const stored = localStorage.getItem(MOCK_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

const saveCurrentMockUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_USER_KEY);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const mockUser = getCurrentMockUser();
    if (mockUser) {
      dispatch(setUser(mockUser));
      toast.success('Welcome back!');
    }
    dispatch(setLoading(false));
    setInitialized(true);
  }, [dispatch]);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch(setLoading(true));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockUsers = getMockUsers();
      const userRecord = mockUsers[email];
      
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Invalid email or password');
      }

      dispatch(setUser(userRecord.user));
      
      if (rememberMe) {
        saveCurrentMockUser(userRecord.user);
      }

      toast.success('Successfully signed in!');
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUsers = getMockUsers();
      
      if (mockUsers[email]) {
        throw new Error('User already exists with this email');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        display_name: email.split('@')[0],
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        user_metadata: {
          full_name: email.split('@')[0],
        },
      };

      mockUsers[email] = { password, user: newUser };
      saveMockUsers(mockUsers);
      
      dispatch(setUser(newUser));
      saveCurrentMockUser(newUser);
      
      toast.success('Account created successfully!');
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signOut = async () => {
    try {
      dispatch(signOutAction());
      saveCurrentMockUser(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUsers = getMockUsers();
      if (!mockUsers[email]) {
        throw new Error('No account found with this email');
      }
      
      toast.success('Password reset instructions sent to your email');
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const updateProfile = async (data: { display_name?: string; avatar_url?: string }) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedUser = { ...user, ...data };
      dispatch(updateProfileAction(data));
      
      // Update in mock storage
      const mockUsers = getMockUsers();
      if (mockUsers[user.email]) {
        mockUsers[user.email].user = updatedUser;
        saveMockUsers(mockUsers);
      }
      saveCurrentMockUser(updatedUser);

      toast.success('Profile updated successfully');
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      if (!user) throw new Error('No user logged in');

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock URL for the avatar
      const mockUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.display_name || user.email)}`;
      
      await updateProfile({ avatar_url: mockUrl });
      
      return { error: null, url: mockUrl };
    } catch (error: any) {
      return { error, url: undefined };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar
  };

  if (!initialized) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};