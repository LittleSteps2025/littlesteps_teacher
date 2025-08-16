import { API_BASE_URL } from '@/utility';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserData {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  children?: ChildData[];
  role: 'parent' | 'teacher';
}

interface ChildData {
  id: string;
  name: string;
  age: number;
  class: string;
  profileImage?: string;
  dateOfBirth?: string;
  allergies?: string[];
  emergencyContact?: string;
}

interface UserContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (userData: UserData, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<UserData>) => Promise<void>;
  updateChildren: (childrenData: ChildData[]) => Promise<void>;
  getAuthToken: () => Promise<string | null>;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app start
  useEffect(() => {
    checkExistingSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkExistingSession = async () => {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('authToken')
      ]);

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        
        // Verify token is still valid with backend
        const isValid = await verifyToken(storedToken);
        
        if (isValid) {
          setUser(userData);
          // Refresh user data from server
          await refreshUserData();
        } else {
          // Token expired, clear storage
          await clearStorage();
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
      await clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  const login = async (userData: UserData, token: string) => {
    try {
      console.log('=== UserContext LOGIN ===');
      console.log('Storing user data:', userData);
      console.log('Storing token:', token.substring(0, 50) + '...');
      
      // Store user data and token
      await Promise.all([
        AsyncStorage.setItem('userData', JSON.stringify(userData)),
        AsyncStorage.setItem('authToken', token),
        AsyncStorage.setItem('loginTime', new Date().toISOString())
      ]);
      
      setUser(userData);
      console.log('✅ UserContext login completed successfully');
    } catch (error) {
      console.error('❌ Error storing session:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Call logout endpoint to invalidate token on server
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Server logout failed:', error);
        }
      }
      
      await clearStorage();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateProfile = async (updatedData: Partial<UserData>) => {
    if (!user) return;

    try {
      const newUserData = { ...user, ...updatedData };
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      setUser(newUserData);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateChildren = async (childrenData: ChildData[]) => {
    if (!user) return;

    try {
      console.log('=== UPDATING CHILDREN IN SESSION ===');
      console.log('Children data to store:', childrenData);
      console.log('Existing user data:', user);
     
      // Merge children data with existing user data (keep all user details)
      const updatedUserData = { 
        ...user,  // Keep all existing user details (id, email, fullName, phone, etc.)
        children: childrenData  // Add/update only the children array
      };
      
      console.log('Updated user data with children:', updatedUserData);
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      
      console.log('✅ Children data added to user session successfully');
    } catch (error) {
      console.error('❌ Error updating children in session:', error);
      throw error;
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/parent/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        await updateProfile(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const clearStorage = async () => {
    await Promise.all([
      AsyncStorage.removeItem('userData'),
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('loginTime')
    ]);
    console.log('🗑️ Session data cleared including children data');
  };

  return (
    <UserContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      updateProfile,
      updateChildren,
      getAuthToken,
      refreshUserData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
