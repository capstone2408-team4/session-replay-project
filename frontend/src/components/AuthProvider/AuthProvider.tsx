import React from 'react';
import axios from 'axios';
import { AuthContextType } from '../../Types';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [projectName, setProjectName] = React.useState<string | null>(null);
  const [projectId, setProjectId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('checking auth status...')
    checkAuthStatus();
  }, [])
  
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me', { withCredentials: true});
      setProjectName(response.data.projectName);
      setProjectId(response.data.projectId);
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
      setProjectId(response.data.projectId);
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
      logout,
      isLoading,
      checkAuthStatus,
      projectId
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  } 

  return context;
};
