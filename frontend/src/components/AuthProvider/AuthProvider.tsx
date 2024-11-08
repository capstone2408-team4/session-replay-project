import React, { Children } from 'react';
import axios from 'axios';

const AuthContext = React.createContext({});

interface AuthProviderProps {
  children: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [projectName, setProjectName] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('checking auth status...')
    checkAuthStatus();
  }, [])
  
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me', { withCredentials: true});
      setProjectName(response.data.user.projectName);
    } catch (error) {
      setProjectName(null);
    } finally {
      setIsLoading(false);
    }
  }
  
  const login = async (projectName: string, password: string) => {
    try {
      const response = await axios.post('api/auth/login', { projectName: projectName, password: password }, { withCredentials: true, headers: {'Content-Type': 'application/json'} });
      setProjectName(response.data.projectName);
      return response.data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      setProjectName(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      projectName,
      login,
      isAuthenticated: !!projectName,
      logout,
      isLoading,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  } 

  return context;
};
